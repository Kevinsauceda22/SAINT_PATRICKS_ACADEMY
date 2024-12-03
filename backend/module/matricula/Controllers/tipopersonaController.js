import conectarDB from '../../../config/db.js';

const pool = await conectarDB();

export const crearTipoPersona = async (req, res) => {
    const { Tipo } = req.body;

    // Validar que el tipo no sea NULL
    if (!Tipo) {
        return res.status(400).json({ Mensaje: 'El tipo de persona no puede ser NULL' });
    }

    try {
        // Verificar si el tipo ya existe
        const [existeTipo] = await pool.query('SELECT * FROM tbl_tipo_persona WHERE Tipo = ?', [Tipo]);
        if (existeTipo.length > 0) {
            return res.status(400).json({ Mensaje: 'El tipo de persona ya existe' });
        }

        // Llamada al procedimiento almacenado para insertar un tipo de persona
        await pool.query('CALL sp_insert_tipo_persona(?)', [Tipo]);

        res.status(201).json({ Mensaje: 'Tipo de persona creado exitosamente' });
    } catch (error) {
        console.error('Error al crear el tipo de persona:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};


// Obtener todos los tipos de persona o uno específico por Cod_tipo_persona
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
            return res.status(404).json({ Mensaje: 'Tipo de persona no encontrado' });
        }

        res.status(200).json(results[0]);
    } catch (error) {
        console.error('Error al obtener el tipo de persona:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para actualizar un tipo de persona
export const actualizarTipoPersona = async (req, res) => {
    const { Cod_tipo_persona } = req.params;
    const { Tipo } = req.body;

    // Verificar que el código del tipo de persona sea válido
    if (!Cod_tipo_persona) {
        return res.status(400).json({ Mensaje: 'El código del tipo de persona es requerido.' });
    }

    // Validar que el tipo sea uno de los valores permitidos
    const tiposValidos = ['P', 'D', 'A', 'E'];
    if (!tiposValidos.includes(Tipo)) {
        return res.status(400).json({ Mensaje: 'Tipo inválido. Los tipos permitidos son: ' + tiposValidos.join(', ') });
    }

    try {
        // Verificar si el tipo ya existe para otro registro
        const [existeTipo] = await pool.query('SELECT * FROM tbl_tipo_persona WHERE Tipo = ? AND Cod_tipo_persona != ?', [Tipo, Cod_tipo_persona]);
        if (existeTipo.length > 0) {
            return res.status(400).json({ Mensaje: 'El tipo de persona ya existe' });
        }

        // Llamada al procedimiento almacenado para actualizar el tipo de persona
        await pool.query('CALL sp_update_tipo_persona(?, ?)', [
            Cod_tipo_persona,
            Tipo
        ]);

        res.status(200).json({ Mensaje: 'Tipo de persona actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el tipo de persona:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};


// Controlador para eliminar un tipo de persona
export const eliminarTipoPersona = async (req, res) => {
    const { Cod_tipo_persona } = req.params;

    try {
        // Llamada al procedimiento almacenado para eliminar el tipo de persona
        await pool.query('CALL sp_delete_tipo_persona(?)', [Cod_tipo_persona]);

        res.status(200).json({ Mensaje: 'Tipo de persona eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el tipo de persona:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
