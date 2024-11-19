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
        if (error.code !== 'ER_SIGNAL_EXCEPTION') {
            // Solo errores no relacionados con la validación se mostrarán en la consola
            console.error('Error inesperado al agregar el estado de asistencia:', error);
        }
         // Devolver el mensaje del error que proviene del procedimiento almacenado
         if (error.code === 'ER_SIGNAL_EXCEPTION') {
            // No mostrar nada en la consola, pero enviar la respuesta con el mensaje de validación
            res.status(400).json({ Mensaje: error.sqlMessage });
        } else {
            // Otro tipo de error (por ejemplo, de conexión o de sintaxis SQL)
            res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
        }
    }
};

// Actualizar un estado de nota
export const actualizarEstadoNota = async (req, res) => {
    const { Cod_estado, Descripcion } = req.body;

    try {
        const [result] =  await pool.query('CALL update_estado_nota(?, ?)', [Cod_estado, Descripcion]);
        // Verificar si no se actualizó ningún registro
        if (result.affectedRows === 0) {
            return res.status(404).json({ Mensaje: 'No se encontró el estado de asistencia con el código proporcionado' });
        }
        // Si todo va bien
        res.status(200).json({ Mensaje: 'Estado nota actualizada exitosamente' });
    } catch (error) {
        // Filtrar errores de validación de procedimientos almacenados
        if (error.code === 'ER_SIGNAL_EXCEPTION') {
            // Devolver el mensaje que proviene del procedimiento almacenado
            res.status(400).json({ Mensaje: error.sqlMessage });
        } else {
            // Otro tipo de error (servidor, conexión, etc.)
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
