import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


// Obtener todas las asistencias
export const obtenerAsistencias = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL get_all_asistencias()');
        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron asistencias' });
        }
    } catch (error) {
        console.error('Error al obtener las asistencias:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Crear una nueva asistencia
export const crearAsistencia = async (req, res) => {
    const { Fecha, Observacion, Cod_estado_asistencia, Cod_seccion_persona } = req.body;

    try {
        await pool.query('CALL insert_asistencia(?, ?, ?, ?)', [
            Fecha, 
            Observacion,
            Cod_estado_asistencia, 
            Cod_seccion_persona
        ]);
        res.status(201).json({ Mensaje: 'Asistencia agregada exitosamente' });
    } catch (error) {
        console.error('Error al agregar la asistencia:', error);
        if (error.code === 'ER_SIGNAL_EXCEPTION') {
            res.status(400).json({ Mensaje: error.sqlMessage });
        } else {
            res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
        }
    }
};

// Actualizar una asistencia
export const actualizarAsistencia = async (req, res) => {
    const { Cod_asistencias, Fecha, Observacion, Cod_estado_asistencia, Cod_seccion_persona } = req.body;

    try {
        await pool.query('CALL update_asistencia(?, ?, ?, ?, ?)', [
            Cod_asistencias,
            Fecha,
            Observacion,
            Cod_estado_asistencia,
            Cod_seccion_persona
        ]);
        res.status(200).json({ Mensaje: 'Asistencia actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar la asistencia:', error);
        if (error.code === 'ER_SIGNAL_EXCEPTION') {
            res.status(400).json({ Mensaje: error.sqlMessage });
        } else {
            res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
        }
    }
};

// Eliminar una asistencia
export const eliminarAsistencia = async (req, res) => {
    const { Cod_asistencias } = req.body;

    if (!Cod_asistencias) {
        return res.status(400).json({ Mensaje: 'Cod_asistencias es requerido' });
    }

    try {
        await pool.query('CALL delete_asistencia(?)', [Cod_asistencias]);
        res.status(200).json({ Mensaje: 'Asistencia eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar la asistencia:', error);
        if (error.code === 'ER_SIGNAL_EXCEPTION') {
            res.status(400).json({ Mensaje: error.sqlMessage });
        } else {
            res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
        }
    }
};
