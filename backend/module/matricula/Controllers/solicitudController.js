// CONTROLLER
import conectarDB from '../../../config/db.js';

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

// Obtener usuarios con rol de administrador
export const obtenerUsuariosPorRolAdmin = async (req, res) => {
  try {
      // Llamar al procedimiento almacenado
      const [results] = await pool.query('CALL obtener_usuarios_por_rol_admin()');

      // Verificar si hay resultados
      if (!results || results[0].length === 0) {
          return res.status(404).json({
              success: false,
              message: 'No se encontraron usuarios con rol de administrador.',
          });
      }

      // Formatear la respuesta
      const usuarios = results[0].map(user => ({
          Cod_rol: user.Cod_rol,
          cod_persona: user.cod_persona,
          correo_usuario: user.correo_usuario,
      }));

      return res.status(200).json({
          success: true,
          data: usuarios,
      });
  } catch (error) {
      console.error('Error al obtener usuarios con rol de administrador:', error);
      return res.status(500).json({
          success: false,
          message: 'Error al obtener usuarios con rol de administrador.',
          error: error.message,
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
      return res.status(201).json({ message: 'Solicitud insertada exitosamente' });
    } catch (error) {
      console.error('Error al insertar la solicitud:', error);
      return res.status(500).json({
        message: 'Error al insertar la solicitud.',
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
      estado, // Nuevo parámetro para el estado
    } = req.body;
  
    if (isNaN(Cod_solicitud)) {
      return res.status(400).json({ message: 'Cod_solicitud debe ser un número válido.' });
    }
  
    if (!Cod_persona || !Nombre_solicitud || !Fecha_solicitud || !Hora_Inicio || !Asunto || !Persona_requerida) {
      return res.status(400).json({
        message: 'Todos los campos son obligatorios, excepto Hora_Fin.',
      });
    }
  
    const now = new Date();
    const citaDate = new Date(`${Fecha_solicitud}T${Hora_Inicio}`);
    const horaInicioVal = parseInt(Hora_Inicio.split(':')[0], 10);
    const horaFinVal = Hora_Fin ? parseInt(Hora_Fin.split(':')[0], 10) : null;
  
    // Validar que la fecha/hora no sean pasadas
    if (citaDate < now) {
      return res.status(400).json({
        message: 'No se puede actualizar una cita en una fecha u hora pasada.',
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
  
    // Validar coherencia de horas
    if (Hora_Fin) {
      const [horaInicioHoras, minutoInicio] = Hora_Inicio.split(':').map(Number);
      const [horaFinHoras, minutoFin] = Hora_Fin.split(':').map(Number);
  
      if (
        horaFinHoras < horaInicioHoras ||
        (horaFinHoras === horaInicioHoras && minutoFin <= minutoInicio)
      ) {
        return res.status(400).json({
          message: 'Hora_Fin debe ser mayor que Hora_Inicio.',
        });
      }
    }
  
    try {
      // Determinar estado actualizado basado en el parámetro proporcionado o calcularlo automáticamente
      let estadoActualizado = estado;
  
      // Si el estado proporcionado no es "Cancelada", determinar el estado automáticamente
      if (estado !== 'Cancelada') {
        const currentDateTime = new Date();
        const citaDateTimeEnd = new Date(`${Fecha_solicitud}T${Hora_Fin || Hora_Inicio}`);
  
        if (citaDateTimeEnd <= currentDateTime) {
          estadoActualizado = 'Finalizada';
        } else {
          estadoActualizado = 'Pendiente';
        }
      }
  
      // Llamar al procedimiento almacenado
      const query = 'CALL actualizar_solicitud(?, ?, ?, ?, ?, ?, ?, ?, ?)';
      const params = [
        parseInt(Cod_solicitud, 10),
        Cod_persona,
        Nombre_solicitud,
        Fecha_solicitud,
        Hora_Inicio,
        Hora_Fin || null, // Permitir que Hora_Fin sea null
        Asunto,
        Persona_requerida,
        estadoActualizado, // Pasar el estado actualizado
      ];
  
      const [results] = await pool.query(query, params);
  
      const affectedRows = results[0]?.[0]?.affectedRows;
  
      if (!affectedRows) {
        return res.status(404).json({
          message: 'Solicitud no encontrada o sin cambios.',
        });
      }
  
      // Respuesta exitosa con el nuevo estado
      res.status(200).json({
        message: 'Solicitud actualizada correctamente.',
        estado: estadoActualizado, // Confirmar el nuevo estado en la respuesta
      });
    } catch (error) {
      console.error('Error al actualizar la solicitud:', error);
      res.status(500).json({
        message: 'Error al actualizar la solicitud.',
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
