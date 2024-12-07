// CONTROLLER
import conectarDB from '../../../config/db.js';

import { enviarNotificacionCambioCitaPadres,enviarNotificacionCancelacionCitaPadres } from '../../../helpers/emailHelper.js';
const pool = await conectarDB();

// Obtener todas las solicitudes o una solicitud por Cod_solicitud
export const obtenerSolicitudesx = async (req, res) => {
    const { Cod_solicitud } = req.query;

    try {
        let query;
        let params;

        if (Cod_solicitud) {
            query = 'CALL obtener_solicitudes(?)'; // Llama al procedimiento almacenado para una solicitud específica
            params = [Cod_solicitud];
        } else {
            query = 'CALL obtener_solicitudes()'; // Llama al procedimiento almacenado para obtener todas las solicitudes
            params = [];
        }

        const [results] = await pool.query(query, params);

        // Verificar si hay resultados
        if (!results || results[0].length === 0) {
            return res.status(404).json({ message: 'No se encontraron solicitudes' });
        }

        // Formatear las fechas correctamente y mantener las horas como cadenas
        const formattedResults = results[0].map((solicitud) => {
            let formattedFechaSolicitud = null;

            // Intentar convertir la fecha y verificar si es válida
            if (solicitud.Fecha_solicitud) {
                const fechaSolicitud = new Date(solicitud.Fecha_solicitud);
                if (!isNaN(fechaSolicitud)) {
                    formattedFechaSolicitud = fechaSolicitud.toISOString().split('T')[0]; // Fecha en formato ISO sin hora
                }
            }

            // Dejar las horas como cadenas, ya que son valores de tipo TIME
            const formattedHoraInicio = solicitud.Hora_Inicio || null;
            const formattedHoraFin = solicitud.Hora_fin || null;

            return {
                ...solicitud,
                Fecha_solicitud: formattedFechaSolicitud,
                Hora_Inicio: formattedHoraInicio,
                Hora_fin: formattedHoraFin,
            };
        });

        // Si se solicita una sola solicitud, retornar un objeto
        if (Cod_solicitud) {
            return res.status(200).json(formattedResults[0]); // Retorna solo la primera solicitud
        }

        return res.status(200).json(formattedResults); // Retornar todas las solicitudes formateadas
    } catch (error) {
        console.error('Error al obtener la solicitud:', error);
        return res.status(500).json({ message: 'Error al obtener las solicitudes', error: error.message });
    }
};
export const obtenerPersonaPorDni = async (req, res) => {
    const { dni } = req.params; // Obtener DNI desde los parámetros de la URL
  
    if (!dni) {
        return res.status(400).json({ message: 'El parámetro DNI es obligatorio.' });
    }
  
    try {
        // Llamar al procedimiento almacenado
        const query = 'CALL obtener_persona_por_dni(?)';
        const [results] = await pool.query(query, [dni]);
  
        if (!results || results[0].length === 0) {
            return res.status(404).json({ message: 'No se encontró ninguna persona con ese DNI.' });
        }
  
        // Extraer el resultado
        const persona = results[0][0];
  
        res.status(200).json({
            cod_persona: persona.cod_persona,
            nombre_completo: persona.nombre_completo.trim(), // Asegurar que el nombre completo esté limpio
        });
    } catch (error) {
        console.error('Error al buscar persona por DNI:', error);
        res.status(500).json({
            message: 'Ocurrió un error al buscar la persona.',
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
        estado,
        motivoCancelacion,
    } = req.body;

    try {
        // Validar Cod_solicitud
        if (isNaN(Cod_solicitud)) {
            return res.status(400).json({ message: 'Cod_solicitud debe ser un número válido.' });
        }

        // Validar campos obligatorios
        if (!Cod_persona || !Nombre_solicitud || !Fecha_solicitud || !Hora_Inicio || !Asunto || !Persona_requerida) {
            return res.status(400).json({
                message: 'Todos los campos son obligatorios, excepto Hora_Fin.',
            });
        }

        // Validaciones de tiempo y rango horario
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

        // Obtener información del usuario relacionado con la solicitud
        const [personaData] = await pool.query(`
            SELECT 
                p.Nombre AS Persona_Nombre,
                u.correo_usuario AS Persona_Correo
            FROM 
                tbl_personas p
            INNER JOIN 
                tbl_usuarios u
            ON 
                p.Cod_persona = u.cod_persona
            WHERE 
                p.Cod_persona = ?;
        `, [Cod_persona]);

        if (personaData.length === 0) {
            return res.status(404).json({ message: 'No se encontraron datos asociados a la persona.' });
        }

        const { Persona_Nombre, Persona_Correo } = personaData[0];

        // Determinar estado actualizado
        let estadoActualizado = estado || 'Pendiente';

        if (estado === 'Activo') {
            estadoActualizado = 'Activo';
        } else if (estado !== 'Cancelada') {
            const currentDateTime = new Date();
            const citaDateTimeEnd = new Date(`${Fecha_solicitud}T${Hora_Fin || Hora_Inicio}`);

            if (citaDateTimeEnd <= currentDateTime) {
                estadoActualizado = 'Finalizada';
            }
        }

        // Actualizar la solicitud en la base de datos
        const query = 'CALL actualizar_solicitud(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const params = [
            parseInt(Cod_solicitud, 10),
            Cod_persona,
            Nombre_solicitud,
            Fecha_solicitud,
            Hora_Inicio,
            Hora_Fin || null,
            Asunto,
            Persona_requerida,
            estadoActualizado,
            motivoCancelacion || null,
        ];

        const [result] = await pool.query(query, params);

        const { affectedRows, updatedState } = result[0][0];

        if (affectedRows === 0) {
            return res.status(404).json({ message: 'Solicitud no encontrada o sin cambios.' });
        }

        // Preparar detalles de la cita actual para la notificación
        const citaActual = {
            Nombre_solicitud: Nombre_solicitud || 'Sin especificar',
            Fecha_solicitud: Fecha_solicitud || 'Sin especificar',
            Hora_Inicio: Hora_Inicio || 'N/A',
            Hora_Fin: Hora_Fin || 'N/A',
            Asunto: Asunto || 'Sin especificar',
        };

        // Enviar notificaciones
        if (estadoActualizado === 'Cancelada') {
            await enviarNotificacionCancelacionCitaPadres(
                Persona_Correo,
                Persona_Nombre,
                Nombre_solicitud,
                motivoCancelacion || 'No especificado'
            );
        } else {
            await enviarNotificacionCambioCitaPadres(Persona_Correo, Persona_Nombre, citaActual);
        }

        res.status(200).json({
            message: 'Solicitud actualizada y notificaciones enviadas correctamente.',
            estado: estadoActualizado,
        });
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

export const obtenerSolicitudConPersona = async (req, res) => {
    try {
        const { Cod_solicitud } = req.params; // Extraer Cod_solicitud desde los parámetros de la ruta

        if (!Cod_solicitud) {
            return res.status(400).json({
                message: 'El parámetro Cod_solicitud es obligatorio.',
            });
        }

        // Consulta SQL para obtener la solicitud, el nombre completo y el correo de la persona asociada
        const query = `
            SELECT 
                s.Cod_solicitud, 
                s.Cod_persona, 
                s.Fecha_solicitud, 
                s.Hora_Inicio, 
                s.Hora_Fin, 
                s.Asunto, 
                s.Estado, 
                p.Nombre AS Persona_Nombre,
                p.Primer_apellido AS Persona_Apellido,
                u.correo_usuario AS Persona_Correo
            FROM 
                tbl_solicitud s
            INNER JOIN 
                tbl_personas p 
            ON 
                s.Cod_persona = p.Cod_persona
            LEFT JOIN 
                tbl_usuarios u
            ON 
                p.Cod_persona = u.cod_persona
            WHERE 
                s.Cod_solicitud = ?;
        `;

        // Ejecutar la consulta con el Cod_solicitud como parámetro
        const [results] = await pool.query(query, [Cod_solicitud]);

        // Verificar si hay resultados
        if (results.length === 0) {
            return res.status(404).json({ message: 'Solicitud no encontrada.' });
        }

        // Devolver el resultado como respuesta
        return res.status(200).json(results[0]);
    } catch (error) {
        console.error('Error al obtener la solicitud con persona:', error);
        return res.status(500).json({
            message: 'Ocurrió un error al obtener la solicitud con persona.',
        });
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
