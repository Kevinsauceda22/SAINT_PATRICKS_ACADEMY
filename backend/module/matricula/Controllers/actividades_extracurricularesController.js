import conectarDB from '../../../config/db.js';
const pool = await conectarDB();

// Controlador para obtener actividades extracurriculares
export const obtenerActividadesExtra = async (req, res) => {
    const { Cod_actividades_extracurriculares } = req.params;

    try {
        let query;
        let params;

        if (Cod_actividades_extracurriculares) {
            query = 'CALL sp_obtener_actividad_extracurricular(?)';
            params = [Cod_actividades_extracurriculares];
        } else {
            query = 'CALL sp_obtener_actividad_extracurricular(?)';
            params = [0];
        }

        const [rows] = await pool.query(query, params);

        if (!rows || rows[0].length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron actividades extracurriculares.' });
        }

        res.status(200).json(rows[0]); // Asegúrate de enviar toda la información, incluido Nombre_seccion
    } catch (error) {
        console.error('Error al obtener las actividades extracurriculares:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para crear una nueva actividad extracurricular
export const crearActividadesExtra = async (req, res) => {
    const { p_Nombre, p_Descripcion, p_Hora_inicio, p_Hora_final, p_Nombre_seccion, p_Fecha } = req.body;

    try {
        // Verifica que se proporcionen todos los parámetros requeridos
        if (!p_Nombre || !p_Descripcion || !p_Hora_inicio || !p_Hora_final || !p_Nombre_seccion || !p_Fecha) {
            return res.status(400).json({ mensaje: "Todos los campos son requeridos." });
        }

        // Llama al procedimiento almacenado para insertar la actividad
        const [result] = await pool.query(
            'CALL sp_insertar_actividad_extracurricular(?, ?, ?, ?, ?, ?)', 
            [p_Nombre, p_Descripcion, p_Hora_inicio, p_Hora_final, p_Nombre_seccion, p_Fecha]
        );

        // Responde con un mensaje de éxito
        return res.status(201).json({ mensaje: "Actividad extracurricular insertada con éxito", data: result });
    } catch (error) {
        console.error('Error al insertar la actividad extracurricular:', error);
        return res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};


// Controlador para actualizar una actividad extracurricular
export const actualizarActividadesExtra = async (req, res) => {
    const { p_Cod_actividad, p_Nombre, p_Descripcion, p_Hora_inicio, p_Hora_final, p_Nombre_seccion, p_Fecha } = req.body;

    try {
        // Verifica que se proporcionen todos los parámetros requeridos
        if (!p_Cod_actividad || !p_Nombre || !p_Descripcion || !p_Hora_inicio || !p_Hora_final || !p_Nombre_seccion || !p_Fecha) {
            return res.status(400).json({ mensaje: "Todos los campos son requeridos." });
        }

        // Llama al procedimiento almacenado para actualizar la actividad
        const [result] = await pool.query('CALL sp_actualizar_actividad_extracurricular(?, ?, ?, ?, ?, ?, ?)', [
            p_Cod_actividad,
            p_Nombre,
            p_Descripcion,
            p_Hora_inicio,
            p_Hora_final,
            p_Nombre_seccion,
            p_Fecha,
        ]);

        // Responde con un mensaje de éxito
        return res.status(200).json({ mensaje: 'Actividad extracurricular actualizada correctamente.', data: result });
    } catch (error) {
        console.error('Error al actualizar la actividad extracurricular:', error);

        // Si el error es personalizado del procedimiento almacenado
        if (error.sqlState === '45000') {
            return res.status(400).json({ mensaje: error.message });
        }

        // Otros errores de servidor
        return res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};


// Controlador para cambiar el estado de una actividad extracurricular
export const cambiarEstadoActividad = async (req, res) => {
    const { p_Cod_actividades_extracurriculares, p_Estado } = req.body;

    try {
        // Validar que se reciban los parámetros necesarios
        if (!p_Cod_actividades_extracurriculares || !p_Estado) {
            return res.status(400).json({ mensaje: 'Todos los campos son requeridos.' });
        }

        // Validar que el estado sea válido ("Activa" o "Cancelada")
        if (!['Activa', 'Cancelada'].includes(p_Estado)) {
            return res.status(400).json({ mensaje: 'Estado no válido. Debe ser "Activa" o "Cancelada".' });
        }

        // Llamar al procedimiento almacenado para cambiar el estado
        const [result] = await pool.query(
            'CALL sp_cambiar_estado_actividad(?, ?)',
            [p_Cod_actividades_extracurriculares, p_Estado]
        );

        // Responder con éxito
        return res.status(200).json({ mensaje: `Estado de la actividad actualizado a ${p_Estado}.`, data: result });
    } catch (error) {
        console.error('Error al cambiar el estado de la actividad extracurricular:', error);

        // Si el error es personalizado (proveniente del procedimiento almacenado)
        if (error.sqlState === '45000') {
            return res.status(400).json({ mensaje: error.message });
        }

        // Otros errores de servidor
        return res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};


// Controlador para eliminar una actividad extracurricular
export const eliminarActividadExtracurricular = async (req, res) => {
    const { Cod_actividad } = req.params; // Asegúrate de que el nombre del parámetro coincide con lo que envías en la ruta

    try {
        // Procedimiento almacenado llamado con el código de la actividad extracurricular
        const [result] = await pool.query('CALL sp_eliminar_actividad_extracurricular(?)', [Cod_actividad]);

        // Verificar si se eliminó alguna actividad
        if (result.affectedRows > 0) {
            return res.status(200).json({ mensaje: 'Actividad extracurricular eliminada correctamente.' });
        } else {
            return res.status(404).json({ mensaje: 'No se encontró la actividad extracurricular especificada.' });
        }
    } catch (error) {
        console.error('Error al eliminar la actividad extracurricular:', error);
        // Si el error es personalizado (proveniente del procedimiento almacenado)
        if (error.sqlState === '45000') {
            return res.status(400).json({ mensaje: error.message });
        }
        // Para otros errores de servidor
        return res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};