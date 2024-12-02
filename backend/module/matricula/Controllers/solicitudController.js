// CONTROLLER
import conectarDB from '../../../config/db.js';
import { enviarNotificacionNuevaCita } from '../../../helpers/emailHelper.js';
import { enviarNotificacionCambioCita, enviarNotificacionCancelacionCita } from '../../../helpers/emailHelper.js';

const pool = await conectarDB();
export const obtenerSolicitudes = async (req, res) => {
    try {
        const { Cod_solicitud } = req.query; // Parámetro opcional
        const cod_persona = req.usuario?.cod_persona; // Extraer cod_persona del usuario autenticado

        if (!cod_persona && !Cod_solicitud) {
            return res.status(400).json({
                message: 'Se requiere cod_persona para listar solicitudes o Cod_solicitud para una específica.',
            });
        }

        let query;
        let params;

        if (Cod_solicitud) {
            // Obtener una solicitud específica
            query = 'CALL obtener_solicitudes(?)';
            params = [Cod_solicitud];
        } else {
            // Obtener solicitudes para el usuario autenticado
            query = 'CALL obtener_solicitudes_por_usuario(?)';
            params = [cod_persona];
        }

        const [results] = await pool.query(query, params);

        if (!results || results[0].length === 0) {
            return res.status(404).json({ message: 'No se encontraron solicitudes.' });
        }

        // Procesar solicitudes para asegurar formato consistente
        const formattedResults = results[0].map((solicitud) => {
            const formattedFecha = solicitud.Fecha_solicitud
                ? new Date(solicitud.Fecha_solicitud).toISOString().split('T')[0]
                : null;

            // Formatear Hora_Inicio y Hora_Fin correctamente
            const formattedHoraInicio = solicitud.Hora_Inicio ? solicitud.Hora_Inicio.slice(0, 5) : '00:00';
            const formattedHoraFin = solicitud.Hora_fin && solicitud.Hora_fin !== 'null'
                ? solicitud.Hora_fin.slice(0, 5)
                : '00:00'; // Si Hora_Fin es inválida, default "00:00"

            return {
                Cod_solicitud: solicitud.Cod_solicitud,
                Cod_persona: solicitud.Cod_persona,
                Nombre_solicitud: solicitud.Nombre_solicitud,
                Fecha_solicitud: formattedFecha,
                Hora_Inicio: formattedHoraInicio,
                Hora_Fin: formattedHoraFin, // Solo esta Hora_Fin se envía a la vista
                Asunto: solicitud.Asunto,
                Persona_requerida: solicitud.Persona_requerida,
                Estado: solicitud.Estado,
            };
        });

        return res.status(200).json(formattedResults);
    } catch (error) {
        console.error('Error al obtener las solicitudes:', error);
        return res.status(500).json({ message: 'Error al obtener las solicitudes.' });
    }
};
export const obtenerUsuariosPorRolAdmin = async (req, res) => {
  try {
      const query = 'CALL obtener_usuarios_por_rol_admin()';
      const [results] = await pool.query(query);

      if (!results || results[0].length === 0) {
          return res.status(404).json({
              message: 'No se encontraron usuarios con rol de administrador.',
          });
      }

      const usuarios = results[0].map((usuario) => ({
          Cod_rol: usuario.Cod_rol,
          cod_persona: usuario.cod_persona,
          correo_usuario: usuario.correo_usuario,
      }));

      return res.status(200).json({
          message: 'Usuarios con rol de administrador obtenidos correctamente.',
          usuarios,
      });
  } catch (error) {
      console.error('Error al obtener usuarios por rol admin:', error);
      return res.status(500).json({
          message: 'Error al obtener usuarios por rol de administrador.',
          error: error.message || 'Error desconocido',
      });
  }
};


export const insertarSolicitud = async (req, res) => {
  const { Cod_persona, Nombre_solicitud, Fecha_solicitud, Hora_Inicio, Hora_Fin, Asunto, Persona_requerida } = req.body;

  try {
      const now = new Date();
      const citaDate = new Date(`${Fecha_solicitud}T${Hora_Inicio}`);
      const horaInicioVal = parseInt(Hora_Inicio.split(':')[0], 10);
      const horaFinVal = Hora_Fin ? parseInt(Hora_Fin.split(':')[0], 10) : null;

      // Validar que la fecha/hora no sean pasadas
      if (citaDate < now) {
          return res.status(400).json({
              message: 'No se puede crear una cita en una fecha u hora pasada.',
          });
      }

      // Validar que las horas estén dentro del rango permitido (8:00 a.m. - 4:00 p.m.)
      if (
          horaInicioVal < 8 ||
          horaInicioVal >= 16 ||
          (horaFinVal !== null && (horaFinVal < 8 || horaFinVal > 16))
      ) {
          return res.status(400).json({
              message: 'Las citas solo se pueden programar entre las 8:00 a.m. y las 4:00 p.m.',
          });
      }

      // Insertar la solicitud utilizando un procedimiento almacenado
      const query = 'CALL insertar_solicitud(?, ?, ?, ?, ?, ?, ?)';
      const params = [
          Cod_persona,
          Nombre_solicitud,
          Fecha_solicitud,
          Hora_Inicio,
          Hora_Fin,
          Asunto,
          Persona_requerida,
      ];

      await pool.query(query, params);

      // Obtener los correos de los administradores
      const [adminResults] = await pool.query('CALL obtener_usuarios_por_rol_admin()');
      const administradores = adminResults[0];

      if (!administradores || administradores.length === 0) {
          return res.status(404).json({
              message: 'No se encontraron administradores para enviar notificaciones.',
          });
      }

      // Preparar los detalles de la cita para enviar en el correo
      const citaDetalles = {
          Nombre_solicitud,
          Fecha_solicitud,
          Hora_Inicio,
          Hora_Fin,
          Asunto,
          Persona_requerida,
      };

      // Enviar notificaciones a cada administrador
      const envioCorreos = administradores.map((admin) =>
          enviarNotificacionNuevaCita(admin.correo_usuario, `Administrador ${admin.cod_persona}`, citaDetalles)
      );

      // Esperar a que todos los correos se envíen
      await Promise.all(envioCorreos);

      return res.status(201).json({ message: 'Solicitud insertada y notificaciones enviadas exitosamente.' });
  } catch (error) {
      console.error('Error al insertar la solicitud o enviar notificaciones:', error.message);
      return res.status(500).json({
          message: 'Error al insertar la solicitud o enviar notificaciones.',
          error: error.message,
      });
  }
};


export const actualizarSolicitud = async (req, res) => {
    const { Cod_solicitud } = req.params;
    const {
        Cod_persona,
        Nombre_solicitud,
        Fecha_solicitud,
        Hora_Inicio,
        Hora_Fin,
        Asunto,
        Persona_requerida,
        estado,
        motivoCancelacion,
    } = req.body;

    try {
        // Validar parámetros básicos
        if (isNaN(Cod_solicitud)) {
            return res.status(400).json({ message: 'Cod_solicitud debe ser un número válido.' });
        }

        if (!Cod_persona || !Nombre_solicitud || !Fecha_solicitud || !Hora_Inicio || !Asunto || !Persona_requerida) {
            return res.status(400).json({
                message: 'Todos los campos son obligatorios, excepto Hora_Fin.',
            });
        }

        // Preparar parámetros para la consulta
        const params = [
            parseInt(Cod_solicitud, 10),
            parseInt(Cod_persona, 10),
            Nombre_solicitud,
            Fecha_solicitud,
            Hora_Inicio,
            Hora_Fin || null,
            Asunto,
            Persona_requerida,
            estado,
            motivoCancelacion || null, // Incluye el motivo de cancelación
        ];

        // Ejecutar procedimiento almacenado
        const [result] = await pool.query('CALL actualizar_solicitud(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', params);

        // Validar resultado del procedimiento
        if (!result || !result[0] || result[0].length === 0) {
            return res.status(500).json({ message: 'Error inesperado al procesar la solicitud.' });
        }

        const { affectedRows, updatedState } = result[0][0];

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Solicitud no encontrada o sin cambios.' });
        }

        // Obtener administradores para notificaciones
        const [adminResults] = await pool.query('CALL obtener_usuarios_por_rol_admin()');
        const administradores = adminResults[0];

        if (!administradores || administradores.length === 0) {
            console.warn('No se encontraron administradores para notificar.');
            return res.status(404).json({ message: 'No se encontraron administradores para enviar notificaciones.' });
        }

        // Manejar notificaciones basadas en el estado actualizado
        if (updatedState === 'Cancelada') {
            console.log('Notificando cancelación...');
            const envioCancelacion = administradores.map((admin) =>
                enviarNotificacionCancelacionCita(
                    admin.correo_usuario,
                    `Administrador ${admin.cod_persona}`,
                    Nombre_solicitud,
                    motivoCancelacion || 'No especificado'
                )
            );
            await Promise.all(envioCancelacion);
        } else {
            console.log('Notificando cambios...');
            const detallesCitaActualizada = {
                Nombre_solicitud,
                Fecha_solicitud,
                Hora_Inicio,
                Hora_Fin,
                Asunto,
                Persona_requerida,
                Estado: updatedState,
            };

            const envioCambios = administradores.map((admin) =>
                enviarNotificacionCambioCita(
                    admin.correo_usuario,
                    `Administrador ${admin.cod_persona}`,
                    {
                        Nombre_solicitud: result[0][0].Nombre_solicitud_anterior || 'N/A',
                        Fecha_solicitud: result[0][0].Fecha_solicitud_anterior || 'N/A',
                        Hora_Inicio: result[0][0].Hora_Inicio_anterior || 'N/A',
                        Hora_Fin: result[0][0].Hora_Fin_anterior || 'N/A',
                        Asunto: result[0][0].Asunto_anterior || 'N/A',
                        Persona_requerida: result[0][0].Persona_requerida_anterior || 'N/A',
                    },
                    detallesCitaActualizada
                )
            );
            await Promise.all(envioCambios);
        }

        // Respuesta exitosa
        res.status(200).json({ message: 'Solicitud actualizada y notificaciones enviadas exitosamente.' });
    } catch (error) {
        console.error('Error al actualizar la solicitud o enviar notificaciones:', error.message);
        res.status(500).json({
            message: 'Error al actualizar la solicitud o enviar notificaciones.',
            error: error.message,
        });
    }
};




export const actualizarEstadoCitas = async (req, res) => {
    try {
        const query = 'CALL actualizar_estado_citas()'; // Llama al procedimiento almacenado para actualizar los estados
        await pool.query(query);

        return res.status(200).json({ message: 'Citas actualizadas correctamente.' });
    } catch (error) {
        console.error('Error al actualizar las citas:', error);
        return res.status(500).json({ message: 'Error al actualizar las citas', error: error.message });
    }
};



// Obtener una solicitud por Cod_solicitud
export const obtenerSolicitudPorCod = async (req, res) => {
    const { Cod_solicitud } = req.params; // Obtener el parámetro de la ruta

    try {
        const query = 'CALL obtener_solicitudes(?)'; // Llama al procedimiento almacenado
        const params = [Cod_solicitud];

        const [results] = await pool.query(query, params);

        // Verificar si hay resultados
        if (!results || results[0].length === 0) {
            return res.status(404).json({ message: 'Solicitud no encontrada' });
        }

        return res.status(200).json(results[0][0]); // Retornar la solicitud encontrada
    } catch (error) {
        console.error('Error al obtener la solicitud:', error);
        res.status(500).json({ message: 'Error al obtener la solicitud', error: error.message });
    }
};



// Controlador para eliminar una solicitud por Cod_solicitud
export const eliminarSolicitud = async (req, res) => {
    const { Cod_solicitud } = req.params; // Obtenemos Cod_solicitud de los parámetros

    try {
        // Verificar que se proporciona Cod_solicitud
        if (!Cod_solicitud) {
            return res.status(400).json({ message: 'Se debe proporcionar el Cod_solicitud para eliminar.' });
        }

        // Llamar al procedimiento almacenado para eliminar la solicitud
        const query = 'CALL eliminar_solicitud(?)';
        const [results] = await pool.query(query, [Cod_solicitud]);

        // Verificar si se devolvieron resultados
        if (!results || results.length === 0 || !results[0] || results[0].length === 0) {
            return res.status(404).json({ message: 'Solicitud no encontrada o ya eliminada.' });
        }

        // Comprobar si se eliminó alguna fila
        const affectedRows = results[0][0].affectedRows; // Acceder al número de filas afectadas
        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Solicitud no encontrada o ya eliminada.' });
        }

        return res.status(200).json({ message: 'Solicitud eliminada exitosamente.' });
    } catch (error) {
        console.error('Error al eliminar la solicitud:', error);
        res.status(500).json({ message: 'Error al eliminar la solicitud', error: error.message });
    }
};
