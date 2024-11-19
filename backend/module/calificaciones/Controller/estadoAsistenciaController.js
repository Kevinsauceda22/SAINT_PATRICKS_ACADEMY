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
        // Llamada al procedimiento almacenado, donde se manejan todas las validaciones
        await pool.query('CALL insert_estado_asistencia(?)', [Descripcion_asistencia]);

        // Respuesta exitosa
        res.status(201).json({ Mensaje: 'Estado de asistencia agregado exitosamente' });
    } catch (error) {
        // Opcional: Si quieres filtrar qué errores mostrar en la consola, podrías hacer esto:
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


// Actualizar un estado de asistencia
export const actualizarEstadoAsistencia = async (req, res) => {
    const { Cod_estado_asistencia, Descripcion_asistencia } = req.body;

    try {
        // Llamada al procedimiento almacenado
        const [result] = await pool.query('CALL update_estado_asistencia(?, ?)', [Cod_estado_asistencia, Descripcion_asistencia]);
        
        // Verificar si no se actualizó ningún registro
        if (result.affectedRows === 0) {
            return res.status(404).json({ Mensaje: 'No se encontró el estado de asistencia con el código proporcionado' });
        }

        // Si todo va bien
        res.status(200).json({ Mensaje: 'Estado de asistencia actualizado exitosamente' });

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

// Eliminar un estado de asistencia
export const eliminarEstadoAsistencia = async (req, res) => {
    const { Cod_estado_asistencia } = req.body;

    // Validar que el código de estado de asistencia se haya proporcionado
    if (!Cod_estado_asistencia) {
        return res.status(400).json({ Mensaje: 'Cod_estado_asistencia es requerido' });
    }

    try {
        // Llamar al procedimiento almacenado para eliminar el estado de asistencia
        await pool.query('CALL delete_estado_asistencia(?)', [Cod_estado_asistencia]);
        res.status(200).json({ Mensaje: 'Estado de asistencia eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el estado de asistencia:', error);
        if (error.code === 'ER_SIGNAL_EXCEPTION') {
            // Capturar el mensaje de error específico de validación
            res.status(400).json({ Mensaje: error.sqlMessage });
        } else {
            res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
        }
    }
};

