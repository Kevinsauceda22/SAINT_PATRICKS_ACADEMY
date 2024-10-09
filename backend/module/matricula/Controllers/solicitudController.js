import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


// Obtener todas las solicitudes o una solicitud por Cod_solicitud
export const obtenerSolicitudes = async (req, res) => {
    const { Cod_solicitud } = req.query;

    try {
        let query;
        let params;

        if (Cod_solicitud) {
            query = 'CALL obtener_solicitudes(?)'; // Llama al procedimiento almacenado para una solicitud específica
            params = [Cod_solicitud];
        } else {
            query = 'CALL obtener_solicitudes(NULL)'; // Llama al procedimiento almacenado para obtener todas las solicitudes
            params = [null];
        }

        const [results] = await pool.query(query, params);

        // Verificar si hay resultados
        if (!results || results[0].length === 0) {
            return res.status(404).json({ message: 'Solicitud no encontrada' });
        }

        // Formatear las fechas en los resultados
        const formattedResults = results[0].map(solicitud => {
            return {
                ...solicitud,
                Fecha_solicitud: new Date(solicitud.Fecha_solicitud).toLocaleDateString('es-HN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                }),
                // Mantener las horas en su formato original
                Hora_Inicio: solicitud.Hora_Inicio, // Mantener hora de inicio original
                Hora_fin: solicitud.Hora_fin, // Mantener hora de fin original
            };
        });

        return res.status(200).json(formattedResults); // Retornar las solicitudes formateadas
    } catch (error) {
        console.error('Error al obtener la solicitud:', error);
        res.status(500).json({ message: 'Error al obtener la solicitud', error: error.message });
    }
};




// Insertar una nueva solicitud
export const insertarSolicitud = async (req, res) => {
    const { Cod_persona, Nombre_solicitud, Fecha_solicitud, Hora_Inicio, Hora_fin, Asunto, Persona_requerida } = req.body;

    try {
        const query = 'CALL insertar_solicitud(?, ?, ?, ?, ?, ?, ?)'; // Llama al procedimiento almacenado para insertar
        const params = [Cod_persona, Nombre_solicitud, Fecha_solicitud, Hora_Inicio, Hora_fin, Asunto, Persona_requerida];

        await pool.query(query, params);
        return res.status(201).json({ message: 'Solicitud insertada exitosamente' });
    } catch (error) {
        console.error('Error al insertar la solicitud:', error);
        res.status(500).json({ message: 'Error al insertar la solicitud', error: error.message });
    }
};

// Función para actualizar una solicitud
export const actualizarSolicitud = async (req, res) => {
    const { Cod_solicitud } = req.params; // Captura el Cod_solicitud de la URL
    const { Cod_persona, Nombre_solicitud, Fecha_solicitud, Hora_Inicio, Hora_fin, Asunto, Persona_requerida } = req.body;

    try {
        const query = 'CALL actualizar_solicitud(?, ?, ?, ?, ?, ?, ?, ?)';
        const params = [Cod_solicitud, Cod_persona, Nombre_solicitud, Fecha_solicitud, Hora_Inicio, Hora_fin, Asunto, Persona_requerida];

        const [results] = await pool.query(query, params);

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Solicitud no encontrada' });
        }

        return res.status(200).json({ message: 'Solicitud actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar la solicitud:', error);
        res.status(500).json({ message: 'Error al actualizar la solicitud', error: error.message });
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

