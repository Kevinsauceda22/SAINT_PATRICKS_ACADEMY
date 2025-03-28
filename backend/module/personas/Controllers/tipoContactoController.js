import conectarDB from '../../../config/db.js';
const pool = await conectarDB();

// Controlador para obtener todos los contactos
export const obtenerTodoTipoContacto = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL P_Get_TipoContacto()');

        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron tipos de contacto' });
        }
    } catch (error) {
        console.error('Error al obtener la lista de tipos de contacto:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para crear un tipo de contacto
export const crearTipoContacto = async (req, res) => {
    const { tipo_contacto, estado } = req.body;

    try {
        await pool.query('CALL P_Post_TipoContacto(?, ?)', [tipo_contacto, estado]);

        res.status(201).json({ mensaje: 'Tipo de contacto creado exitosamente' });
    } catch (error) {
        console.error('Error al crear tipo de contacto:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para actualizar un tipo de contacto
export const actualizarTipoContacto = async (req, res) => {
    const { cod_tipo_contacto } = req.params;
    const { tipo_contacto, estado } = req.body;

    try {
        await pool.query('CALL P_Put_TipoContacto(?, ?, ?)', [
            cod_tipo_contacto,
            tipo_contacto,
            estado
        ]);

        res.status(200).json({ mensaje: 'Tipo de contacto actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para actualizar el estado de un tipo de contacto
export const actualizarEstadoTipoContacto = async (req, res) => {
    const { cod_tipo_contacto, estado } = req.body;

    // Validar parámetros
    if (!cod_tipo_contacto || estado === undefined) {
        return res.status(400).json({ mensaje: 'Faltan parámetros' });
    }

    try {
        // Llamar al procedimiento almacenado
        const [results] = await pool.query('CALL P_Put_EstadoTipoContacto(?, ?)', [cod_tipo_contacto, estado]);

        // Obtener el mensaje devuelto por el procedimiento
        const mensaje = results[0][0].mensaje;

        console.log(`Estado actualizado para tipo de contacto ${cod_tipo_contacto}: ${estado}`); // Debug en consola
        res.json({ mensaje, cod_tipo_contacto, estado }); // Respuesta al frontend
    } catch (error) {
        console.error('Error al ejecutar el procedimiento almacenado:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

// Controlador para eliminar un tipo de contacto
export const eliminarTipoContacto = async (req, res) => {
    const { cod_tipo_contacto } = req.params;

    if (!cod_tipo_contacto) {
        return res.status(400).json({ Mensaje: 'cod_tipo_contacto es requerido' });
    }

    try {
        await pool.query('CALL P_Delete_TipoContacto(?)', [cod_tipo_contacto]);
        res.status(200).json({ Mensaje: 'Tipo de contacto eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar tipo de contacto:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
