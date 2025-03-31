import conectarDB from '../../../config/db.js';
const pool = await conectarDB();

// Controlador para obtener todos los tipos de documentos
export const obtenerTodoTipoDocumentos = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL P_Get_TipoDocumento()');

        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron tipos de documentos' });
        }
    } catch (error) {
        console.error('Error al obtener la lista de tipos de documentos:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para crear un tipo de documento
export const crearTipoDocumentos = async (req, res) => {
    const { tipo_documento, descripcion, estado } = req.body;

    try {
        await pool.query('CALL P_Post_TipoDocumentos(?, ?, ?)', [tipo_documento, descripcion, estado]);

        res.status(201).json({ mensaje: 'Tipo de documento creado exitosamente' });
    } catch (error) {
        console.error('Error al crear tipo de documento:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para actualizar un tipo de documento
export const actualizarTipoDocumentos = async (req, res) => {
    const { cod_tipo_documento } = req.params;
    const { tipo_documento, descripcion, estado } = req.body;

    try {
        await pool.query('CALL P_Put_TipoDocumentos(?, ?, ?, ?)', [
            cod_tipo_documento,
            tipo_documento,
            descripcion,
            estado
        ]);

        res.status(200).json({ mensaje: 'Tipo de documento actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar tipo de documento:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para actualizar el estado de un tipo de documento
export const actualizarEstadoTipoDocumentos = async (req, res) => {
    const { cod_tipo_documento, estado } = req.body;

    // Validar parámetros
    if (!cod_tipo_documento || estado === undefined) {
        return res.status(400).json({ mensaje: 'Faltan parámetros' });
    }

    try {
        // Llamar al procedimiento almacenado
        const [results] = await pool.query('CALL P_Put_EstadoTipoDocumentos(?, ?)', [cod_tipo_documento, estado]);

        // Obtener el mensaje devuelto por el procedimiento
        const mensaje = results[0][0].mensaje;

        console.log(`Estado actualizado para tipo de documento ${cod_tipo_documento}: ${estado}`); // Debug en consola
        res.json({ mensaje, cod_tipo_documento, estado }); // Respuesta al frontend
    } catch (error) {
        console.error('Error al ejecutar el procedimiento almacenado:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

// Controlador para eliminar un tipo de documento
export const eliminarTipoDocumentos = async (req, res) => {
    const { cod_tipo_documento } = req.params;

    if (!cod_tipo_documento) {
        return res.status(400).json({ Mensaje: 'cod_tipo_documento es requerido' });
    }

    try {
        await pool.query('CALL P_Delete_TipoDocumentos(?)', [cod_tipo_documento]);
        res.status(200).json({ Mensaje: 'Tipo de documento eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar tipo de documento:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
