import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


// Obtener todos los estados de asistencia
export const obtenerEstadoAsistencias = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL get_all_estado_asistencias()');
        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron estados de asistencia' });
        }
    } catch (error) {
        console.error('Error al obtener los estados de asistencia:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Crear un nuevo estado de asistencia
export const crearEstadoAsistencia = async (req, res) => {
    const { Descripcion_asistencia } = req.body;

    try {
        await pool.query('CALL insert_estado_asistencia(?)', [Descripcion_asistencia]);
        res.status(201).json({ Mensaje: 'Estado de asistencia agregado exitosamente' });
    } catch (error) {
        console.error('Error al agregar el estado de asistencia:', error);
        if (error.code === 'ER_SIGNAL_EXCEPTION') {
            res.status(400).json({ Mensaje: error.sqlMessage });
        } else {
            res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
        }
    }
};

// Actualizar un estado de asistencia
export const actualizarEstadoAsistencia = async (req, res) => {
    const { Cod_estado_asistencia, Descripcion_asistencia } = req.body;

    try {
        const [result] = await pool.query('CALL update_estado_asistencia(?, ?)', [Cod_estado_asistencia, Descripcion_asistencia]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ Mensaje: 'No se encontró el estado de asistencia con el código proporcionado' });
        }
        res.status(200).json({ Mensaje: 'Estado de asistencia actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el estado de asistencia:', error);
        if (error.code === 'ER_SIGNAL_EXCEPTION') {
            res.status(400).json({ Mensaje: error.sqlMessage });
        } else {
            res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
        }
    }
};

// Eliminar un estado de asistencia
export const eliminarEstadoAsistencia = async (req, res) => {
    const { Cod_estado_asistencia } = req.body;

    if (!Cod_estado_asistencia) {
        return res.status(400).json({ Mensaje: 'Cod_estado_asistencia es requerido' });
    }

    try {
        await pool.query('CALL delete_estado_asistencia(?)', [Cod_estado_asistencia]);
        res.status(200).json({ Mensaje: 'Estado de asistencia eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el estado de asistencia:', error);
        if (error.code === 'ER_SIGNAL_EXCEPTION') {
            res.status(400).json({ Mensaje: error.sqlMessage });
        } else {
            res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
        }
    }
};
