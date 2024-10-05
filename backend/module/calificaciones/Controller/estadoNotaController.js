import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


// Obtener todos los estados de nota
export const obtenerEstadoNota = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL get_all_estado_nota()');
        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron estados de nota' });
        }
    } catch (error) {
        console.error('Error al obtener los estados de nota:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Crear un nuevo estado de nota
export const crearEstadoNota = async (req, res) => {
    const { Descripcion } = req.body;

    try {
        await pool.query('CALL insert_estado_nota(?)', [Descripcion]);
        res.status(201).json({ Mensaje: 'Estado nota agregada exitosamente' });
    } catch (error) {
        console.error('Error al agregar el estado nota:', error);
        if (error.code === 'ER_SIGNAL_EXCEPTION') {
            res.status(400).json({ Mensaje: error.sqlMessage });
        } else {
            res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
        }
    }
};

// Actualizar un estado de nota
export const actualizarEstadoNota = async (req, res) => {
    const { Cod_estado, Descripcion } = req.body;

    try {
        await pool.query('CALL update_estado_nota(?, ?)', [Cod_estado, Descripcion]);
        res.status(200).json({ Mensaje: 'Estado nota actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el estado nota:', error);
        if (error.code === 'ER_SIGNAL_EXCEPTION') {
            res.status(400).json({ Mensaje: error.sqlMessage });
        } else {
            res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
        }
    }
};

// Eliminar un estado de nota
export const eliminarEstadoNota = async (req, res) => {
    const { Cod_estado } = req.body;

    if (!Cod_estado) {
        return res.status(400).json({ Mensaje: 'Cod_estado es requerido' });
    }

    try {
        await pool.query('CALL delete_estado_nota(?)', [Cod_estado]);
        res.status(200).json({ Mensaje: 'Estado nota eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el estado nota:', error);
        if (error.code === 'ER_SIGNAL_EXCEPTION') {
            res.status(400).json({ Mensaje: error.sqlMessage });
        } else {
            res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
        }
    }
};
