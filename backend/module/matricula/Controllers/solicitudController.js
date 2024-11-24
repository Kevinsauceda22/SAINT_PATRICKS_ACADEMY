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


export const insertarSolicitud = async (req, res) => {
    try {
        const cod_persona = req.usuario?.cod_persona; // Extraer cod_persona del usuario autenticado

        if (!cod_persona) {
            return res.status(400).json({
                message: 'El usuario no está autenticado o falta el código de persona.',
            });
        }

        // Extraer los datos del cuerpo de la solicitud
        const { Nombre_solicitud, Fecha_solicitud, Hora_Inicio, Hora_Fin, Asunto, Persona_requerida } = req.body;

        if (!Nombre_solicitud || !Fecha_solicitud || !Hora_Inicio || !Asunto || !Persona_requerida) {
            return res.status(400).json({
                message: 'Faltan datos requeridos para insertar la solicitud.',
            });
        }

        // Validar coherencia entre Hora_Inicio y Hora_Fin (si está presente)
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

        // Preparar la consulta y los parámetros
        const query = 'CALL insertar_solicitud(?, ?, ?, ?, ?, ?, ?)';
        const params = [
            cod_persona, // cod_persona autenticado
            Nombre_solicitud,
            Fecha_solicitud,
            Hora_Inicio,
            Hora_Fin || null, // Permitir Hora_Fin nula
            Asunto,
            Persona_requerida,
        ];

        const [results] = await pool.query(query, params);

        return res.status(201).json({ message: 'Solicitud insertada exitosamente.' });
    } catch (error) {
        console.error('Error al insertar la solicitud:', error);
        return res.status(500).json({
            message: 'Error al insertar la solicitud.',
            error: error.message,
        });
    }
};



export const actualizarSolicitud = async (req, res) => {
    const { Cod_solicitud } = req.params; // Get the request parameter
    const {
        Cod_persona,
        Nombre_solicitud,
        Fecha_solicitud,
        Hora_Inicio,
        Hora_Fin,
        Asunto,
        Persona_requerida,
    } = req.body;

    // Validate the Cod_solicitud parameter
    if (isNaN(Cod_solicitud)) {
        return res.status(400).json({ message: 'Cod_solicitud debe ser un número válido.' });
    }

    // Validate all required fields
    if (!Cod_persona || !Nombre_solicitud || !Fecha_solicitud || !Hora_Inicio || !Asunto || !Persona_requerida) {
        return res.status(400).json({
            message: 'Todos los campos son obligatorios, excepto Hora_Fin.',
        });
    }

    // Ensure Hora_Fin has a default value if not provided
    const finalHoraFin = Hora_Fin || Hora_Inicio; // Use Hora_Inicio as fallback if Hora_Fin is not provided

    // Validate that Hora_Fin is greater than Hora_Inicio
    const [horaInicioHoras, horaInicioMinutos] = Hora_Inicio.split(':').map(Number);
    const [horaFinHoras, horaFinMinutos] = finalHoraFin.split(':').map(Number);

    if (
        horaFinHoras < horaInicioHoras ||
        (horaFinHoras === horaInicioHoras && horaFinMinutos <= horaInicioMinutos)
    ) {
        return res.status(400).json({
            message: 'Hora_Fin debe ser mayor que Hora_Inicio.',
        });
    }

    try {
        // Determine the status based on the date and time
        const currentDateTime = new Date();
        const citaDateTimeEnd = new Date(`${Fecha_solicitud}T${finalHoraFin}`);

        let estado = 'Pendiente';
        if (citaDateTimeEnd <= currentDateTime) {
            estado = 'Finalizada';
        }

        // Prepare the SQL query and parameters for the stored procedure
        const query = 'CALL actualizar_solicitud(?, ?, ?, ?, ?, ?, ?, ?)';
        const params = [
            parseInt(Cod_solicitud, 10),
            Cod_persona,
            Nombre_solicitud,
            Fecha_solicitud,
            Hora_Inicio,
            finalHoraFin,
            Asunto,
            Persona_requerida,
        ];

        // Execute the query
        const [results] = await pool.query(query, params);

        const affectedRows = results[0]?.[0]?.affectedRows;

        if (!affectedRows) {
            return res.status(404).json({
                message: 'Solicitud no encontrada o sin cambios.',
            });
        }

        // Return a success response
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
