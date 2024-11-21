import conectarDB from '../../../config/db.js';
const pool = await conectarDB();

// Obtener todos los tipos de contrato
export const obtenerTiposContrato = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL get_all_tipos_contrato()');
        
        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron tipos de contrato' });
        }
    } catch (error) {
        console.error('Error al obtener los tipos de contrato:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Crear un nuevo tipo de contrato
export const crearTipoContrato = async (req, res) => {
    const { Descripcion } = req.body;

    try {
        // Llama al procedimiento almacenado que inserta un nuevo tipo de contrato
        await pool.query('CALL insert_tipo_contrato(?)', [Descripcion]);
        res.status(201).json({ Mensaje: 'Tipo de contrato agregado exitosamente' });
    } catch (error) {
        console.error('Error al agregar el tipo de contrato:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Actualizar un tipo de contrato
export const actualizarTipoContrato = async (req, res) => {
    const { Cod_tipo_contrato, Descripcion } = req.body;

    try {
        await pool.query('CALL update_tipo_contrato(?, ?)', [Cod_tipo_contrato, Descripcion]);
        res.status(200).json({ Mensaje: 'Tipo de contrato actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el tipo de contrato:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

export const eliminarTipoContrato = async (req, res) => {
    const { Cod_tipo_contrato } = req.body;

    if (!Cod_tipo_contrato) {
        return res.status(400).json({ Mensaje: 'Cod_tipo_contrato es requerido' });
    }

    try {
        await pool.query('CALL delete_tipo_contrato(?)', [Cod_tipo_contrato]);
        res.status(200).json({ Mensaje: 'Tipo de contrato eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el tipo de contrato:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
