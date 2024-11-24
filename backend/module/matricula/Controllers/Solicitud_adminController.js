// CONTROLLER
import conectarDB from '../../../config/db.js';
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

export const insertarSolicitud = async (req, res) => {
    const { Cod_persona, Nombre_solicitud, Fecha_solicitud, Hora_Inicio, Hora_Fin, Asunto, Persona_requerida } = req.body;

    try {
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

        const [results] = await pool.query(query, params);

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
    } = req.body;

    if (isNaN(Cod_solicitud)) {
        return res.status(400).json({ message: 'Cod_solicitud debe ser un número válido.' });
    }

    if (!Cod_persona || !Nombre_solicitud || !Fecha_solicitud || !Hora_Inicio || !Asunto || !Persona_requerida) {
        return res.status(400).json({
            message: 'Todos los campos son obligatorios, excepto Hora_Fin.',
        });
    }

    // Validar coherencia de horas
    if (Hora_Fin) {
        const [horaInicioHoras, horaInicioMinutos] = Hora_Inicio.split(':').map(Number);
        const [horaFinHoras, horaFinMinutos] = Hora_Fin.split(':').map(Number);

        if (
            horaFinHoras < horaInicioHoras ||
            (horaFinHoras === horaInicioHoras && horaFinMinutos <= horaInicioMinutos)
        ) {
            return res.status(400).json({
                message: 'Hora_Fin debe ser mayor que Hora_Inicio.',
            });
        }
    }

    try {
        // Determinar el estado automáticamente
        const currentDateTime = new Date();
        const citaDateTimeEnd = new Date(`${Fecha_solicitud}T${Hora_Fin || Hora_Inicio}`);

        let estado = 'Pendiente';
        if (citaDateTimeEnd <= currentDateTime) {
            estado = 'Finalizada';
        }

        const query = 'CALL actualizar_solicitud(?, ?, ?, ?, ?, ?, ?, ?)';
        const params = [
            parseInt(Cod_solicitud, 10),
            Cod_persona,
            Nombre_solicitud,
            Fecha_solicitud,
            Hora_Inicio,
            Hora_Fin || null,
            Asunto,
            Persona_requerida,
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
            estado,
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
