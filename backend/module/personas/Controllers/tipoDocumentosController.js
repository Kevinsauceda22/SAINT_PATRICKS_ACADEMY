import conectarDB from '../../../config/db.js';
const pool = await conectarDB();

// Obtener todos los tipos de documentos
export const obtenerTodoTipoDocumento = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL P_Get_tipoDocumento()');

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

// Crear un nuevo tipo de documento
export const crearTipoDocumento = async (req, res) => {
    const { tipo_documento, descripcion, estado_documento } = req.body;

    try {
        await pool.query('CALL P_Post_tipoDocumento(?, ?, ?)', [
            tipo_documento,
            descripcion,
            estado_documento
        ]);

        res.status(201).json({ mensaje: 'Tipo de documento creado exitosamente' });
    } catch (error) {
        console.error('Error al crear tipo de documento:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Actualizar un tipo de documento
export const actualizarTipoDocumento = async (req, res) => {
    const { Cod_tipo_documento } = req.params;
    const { tipo_documento, descripcion, estado_documento } = req.body;

    try {
        await pool.query('CALL P_Put_tipoDocumento(?, ?, ?, ?)', [
            Cod_tipo_documento,
            tipo_documento,
            descripcion,
            estado_documento
        ]);

        res.status(200).json({ mensaje: 'Tipo de documento actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar tipo de documento:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Eliminar un tipo de documento
export const eliminarTipoDocumento = async (req, res) => {
    const { Cod_tipo_documento } = req.params;

    if (!Cod_tipo_documento) {
        return res.status(400).json({ Mensaje: 'Cod_tipo_documento es requerido' });
    }

    try {
        await pool.query('CALL P_Delete_tipoDocumento(?)', [Cod_tipo_documento]);
        res.status(200).json({ Mensaje: 'Tipo de documento eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar tipo de documento:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};