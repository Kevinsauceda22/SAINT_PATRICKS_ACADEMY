import conectarDB from '../../../config/db.js';

const pool = await conectarDB();

// Create TipoPersona - now with VARCHAR validation
export const crearTipoPersona = async (req, res) => {
    const { Tipo } = req.body;

    // Validate that the Tipo field is not empty
    if (!Tipo || typeof Tipo !== 'string' || Tipo.trim() === '') {
        return res.status(400).json({ Mensaje: 'El tipo de persona no puede ser vacío.' });
    }

    try {
        // Check if the Tipo already exists
        const [existeTipo] = await pool.query('SELECT * FROM tbl_tipo_persona WHERE Tipo = ?', [Tipo]);
        if (existeTipo.length > 0) {
            return res.status(400).json({ Mensaje: 'El tipo de persona ya existe' });
        }

        // Call the stored procedure to insert a new TipoPersona
        await pool.query('CALL sp_insert_tipo_persona(?)', [Tipo]);

        res.status(201).json({ Mensaje: 'Tipo de persona creado exitosamente' });
    } catch (error) {
        console.error('Error al crear el tipo de persona:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

export const obtenerTipoPersona = async (req, res) => {
    const { Cod_tipo_persona } = req.params;

    try {
        let query;
        let params;

        if (Cod_tipo_persona) {
            query = 'CALL sp_get_tipo_persona(?)'; // Para obtener un tipo específico
            params = [Cod_tipo_persona];
        } else {
            query = 'CALL sp_get_tipo_persona(NULL)'; // Para obtener todos los tipos
            params = [null];
        }

        const [results] = await pool.query(query, params);

        // Verificar si hay resultados
        if (!results || results[0].length === 0) {
            return res.status(200).json([]); // Devolver un arreglo vacío si no hay datos
        }

        res.status(200).json(results[0]);
    } catch (error) {
        console.error('Error al obtener el tipo de persona:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Update TipoPersona
export const actualizarTipoPersona = async (req, res) => {
    const { Cod_tipo_persona } = req.params;
    const { Tipo } = req.body;

    // Validate that the Tipo field is not empty
    if (!Tipo || typeof Tipo !== 'string' || Tipo.trim() === '') {
        return res.status(400).json({ Mensaje: 'El tipo de persona no puede ser vacío.' });
    }

    try {
        // Check if the Tipo already exists for another record
        const [existeTipo] = await pool.query(
            'SELECT * FROM tbl_tipo_persona WHERE Tipo = ? AND Cod_tipo_persona != ?',
            [Tipo, Cod_tipo_persona]
        );
        if (existeTipo.length > 0) {
            return res.status(400).json({ Mensaje: 'El tipo de persona ya existe' });
        }

        // Call the stored procedure to update the TipoPersona
        await pool.query('CALL sp_update_tipo_persona(?, ?)', [Cod_tipo_persona, Tipo]);

        res.status(200).json({ Mensaje: 'Tipo de persona actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el tipo de persona:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Delete TipoPersona
export const eliminarTipoPersona = async (req, res) => {
    const { Cod_tipo_persona } = req.params;

    try {
        // Call the stored procedure to delete the TipoPersona
        await pool.query('CALL sp_delete_tipo_persona(?)', [Cod_tipo_persona]);

        res.status(200).json({ Mensaje: 'Tipo de persona eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el tipo de persona:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
