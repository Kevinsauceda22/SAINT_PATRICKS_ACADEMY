import conectarDB from '../../../config/db.js';

const pool = await conectarDB();

// Controlador para crear un tipo de matrícula
export const crearTipoMatricula = async (req, res) => {
    const { Tipo } = req.body;

    try {
        const [existingTipos] = await pool.query('SELECT * FROM tbl_tipo_matricula WHERE Tipo = ?', [Tipo]);
        if (existingTipos.length > 0) {
            return res.status(400).json({ Mensaje: 'El tipo de matrícula ya existe.' });
        }

        await pool.query('CALL sp_crear_tipo_matricula(?)', [Tipo]);
        const [nuevoTipo] = await pool.query('SELECT * FROM tbl_tipo_matricula WHERE Tipo = ?', [Tipo]);

        if (!nuevoTipo || nuevoTipo.length === 0) {
            throw new Error('Error al obtener el tipo de matrícula recién creado.');
        }

        res.status(201).json(nuevoTipo[0]);
    } catch (error) {
        console.error('Error al crear tipo de matrícula:', error.message);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para actualizar un tipo de matrícula
export const actualizarTipoMatricula = async (req, res) => {
    const { p_cod_tipo_matricula } = req.params;
    const { Tipo } = req.body;

    try {
        const [existingTipos] = await pool.query(
            'SELECT * FROM tbl_tipo_matricula WHERE Tipo = ? AND Cod_tipo_matricula != ?',
            [Tipo, p_cod_tipo_matricula]
        );
        if (existingTipos.length > 0) {
            return res.status(400).json({ Mensaje: 'El tipo de matrícula ya existe.' });
        }

        // Llamada al procedimiento almacenado para actualizar el tipo de matrícula
        await pool.query('CALL sp_actualizar_tipo_matricula(?, ?)', [p_cod_tipo_matricula, Tipo]);

        // Obtener el tipo de matrícula actualizado para devolverlo en la respuesta
        const [tipoActualizado] = await pool.query('SELECT * FROM tbl_tipo_matricula WHERE Cod_tipo_matricula = ?', [p_cod_tipo_matricula]);
        
        if (!tipoActualizado || tipoActualizado.length === 0) {
            throw new Error('Error al obtener el tipo de matrícula actualizado.');
        }

        res.status(200).json(tipoActualizado[0]); // Devolver el registro actualizado completo
    } catch (error) {
        console.error('Error al actualizar tipo de matrícula:', error.message);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para eliminar un tipo de matrícula
export const eliminarTipoMatricula = async (req, res) => {
    const { p_cod_tipo_matricula } = req.params;

    try {
        await pool.query('CALL sp_eliminar_tipo_matricula(?)', [p_cod_tipo_matricula]);
        res.status(200).json({ Mensaje: 'Tipo de matrícula eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar tipo de matrícula:', error.message);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para consultar tipos de matrícula
export const consultarTipoMatricula = async (req, res) => {
    const { p_cod_tipo_matricula } = req.params;

    try {
        let query;
        let params;

        if (p_cod_tipo_matricula) {
            query = 'CALL sp_consultar_tipo_matricula(?)';
            params = [p_cod_tipo_matricula];
        } else {
            query = 'CALL sp_consultar_tipo_matricula(NULL)';
            params = [null];
        }

        const [results] = await pool.query(query, params);

        if (!results || results[0].length === 0) {
            return res.status(404).json({ Mensaje: 'Tipo de matrícula no encontrado' });
        }

        res.status(200).json(results[0]);
    } catch (error) {
        console.error('Error al consultar tipos de matrícula:', error.message);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
