import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


// Controlador para obtener todas o una actividad extracurricular por nombre de actividad o nombre de sección
export const obtenerActExtra = async (req, res) => {
    const { Nombre_actividad, Nombre_seccion } = req.params; // Extraemos los parámetros de la URL

    try {
        // Si los valores son vacíos o 'null', los pasamos como null explícitamente al procedimiento almacenado
        const query = 'CALL sp_get_actividades_extracurriculares(?, ?)';
        const [results] = await pool.query(query, [
            Nombre_actividad && Nombre_actividad !== 'null' ? Nombre_actividad : null,
            Nombre_seccion && Nombre_seccion !== 'null' ? Nombre_seccion : null
        ]);

        // Verificar si se encontraron registros
        if (results[0].length === 0) {
            return res.status(404).json({ message: 'Actividad extracurricular no encontrada' });
        }

        return res.status(200).json(results[0]); // Asegúrate de acceder al primer elemento del array
    } catch (error) {
        console.error('Error al obtener la actividad extracurricular:', error);
        res.status(500).json({ message: 'Error al obtener la actividad extracurricular', error });
    }
};

// Controlador para crear una actividad extracurricular
export const crearActividadExtracurricular = async (req, res) => {
    const {
        p_nombre_actividad,
        p_descripcion,
        p_hora_inicio,
        p_hora_final,
        p_nombre_seccion,
        p_fecha
    } = req.body;

    try {
        // Llamamos al procedimiento almacenado para insertar una actividad extracurricular
        await pool.query('CALL sp_insert_actividad_extracurricular(?, ?, ?, ?, ?, ?)', [
            p_nombre_actividad,
            p_descripcion,
            p_hora_inicio,
            p_hora_final,
            p_nombre_seccion,
            p_fecha || null  // Si no se proporciona una fecha, pasamos null para usar la fecha actual por defecto
        ]);

        res.status(201).json({ Mensaje: 'Actividad extracurricular creada exitosamente' });
    } catch (error) {
        console.error('Error al crear la actividad extracurricular:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para actualizar una actividad extracurricular
export const actualizarActividadExtracurricular = async (req, res) => {
    const {
        p_cod_actividad,
        p_nombre_actividad,
        p_descripcion,
        p_hora_inicio,
        p_hora_final,
        p_nombre_seccion,
        p_fecha
    } = req.body;

    try {
        // Llamamos al procedimiento almacenado para actualizar la actividad extracurricular
        await pool.query('CALL sp_update_actividad_extracurriculares(?, ?, ?, ?, ?, ?, ?)', [
            p_cod_actividad,
            p_nombre_actividad,
            p_descripcion,
            p_hora_inicio,
            p_hora_final,
            p_nombre_seccion,
            p_fecha || null  // Si no se proporciona una fecha, pasamos null
        ]);

        res.status(200).json({ Mensaje: 'Actividad extracurricular actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar la actividad extracurricular:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para eliminar una actividad extracurricular
export const eliminarActividadExtracurricular = async (req, res) => {
    const { p_cod_actividad } = req.params;

    try {
        // Llamar al procedimiento almacenado para eliminar la actividad extracurricular
        const [rows] = await pool.query("CALL sp_delete_actividad_extracurriculares(?)", [p_cod_actividad]);

        // Verificar si se eliminó la actividad
        if (rows.affectedRows > 0) {
            return res.status(200).json({ message: 'Actividad extracurricular eliminada correctamente.' });
        } else {
            return res.status(404).json({ message: 'No se encontró la actividad extracurricular especificada.' });
        }
    } catch (error) {
        console.error('Error al eliminar la actividad extracurricular:', error);
        return res.status(500).json({ message: 'Ocurrió un error al intentar eliminar la actividad extracurricular.', error });
    }
};
