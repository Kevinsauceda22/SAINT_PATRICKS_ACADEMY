import conectarDB from '../../../config/db.js';

const pool = await conectarDB();

// Controlador para crear un tipo de matrícula
export const crearTipoMatricula = async (req, res) => {
    const { Tipo } = req.body; // Obtenemos el tipo de matrícula

    // Verificamos que el tipo sea válido
    const tiposValidos = ['Estandar', 'Extraordinaria', 'Beca', 'Otras'];
    if (!tiposValidos.includes(Tipo)) {
        return res.status(400).json({ Mensaje: 'Tipo inválido. Los tipos permitidos son: ' + tiposValidos.join(', ') });
    }

    try {
        // Verificar si ya existe el tipo de matrícula
        const [existingTipos] = await pool.query('SELECT * FROM tbl_tipo_matricula WHERE Tipo = ?', [Tipo]);
        if (existingTipos.length > 0) {
            return res.status(400).json({ Mensaje: 'El tipo de matrícula ya existe.' });
        }

        // Llamada al procedimiento almacenado para crear un tipo de matrícula
        await pool.query('CALL sp_crear_tipo_matricula(?)', [Tipo]);
        res.status(201).json({ Mensaje: 'Tipo de matrícula creado exitosamente' });
    } catch (error) {
        console.error('Error al crear tipo de matrícula:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para actualizar un tipo de matrícula
export const actualizarTipoMatricula = async (req, res) => {
    const { p_cod_tipo_matricula } = req.params; // Obtenemos el código del tipo de matrícula desde los parámetros
    const { Tipo } = req.body; // Obtenemos el nuevo tipo de matrícula

    console.log('p_cod_tipo_matricula recibido:', p_cod_tipo_matricula); // Verificar que recibimos el parámetro
    console.log('Tipo recibido:', Tipo); // Verificar que recibimos el tipo

    // Verificar si el parámetro es válido
    if (!p_cod_tipo_matricula) {
        return res.status(400).json({ Mensaje: 'El código de tipo de matrícula es requerido.' });
    }

    const tiposValidos = ['Estandar', 'Extraordinaria', 'Beca', 'Otras'];
    if (!tiposValidos.includes(Tipo)) {
        return res.status(400).json({ Mensaje: 'Tipo inválido. Los tipos permitidos son: ' + tiposValidos.join(', ') });
    }

    try {
        // Verificar si el nuevo tipo de matrícula ya existe
        const [existingTipos] = await pool.query('SELECT * FROM tbl_tipo_matricula WHERE Tipo = ? AND Cod_tipo_matricula != ?', [Tipo, p_cod_tipo_matricula]);
        if (existingTipos.length > 0) {
            return res.status(400).json({ Mensaje: 'El tipo de matrícula ya existe.' });
        }

        // Llamada al procedimiento almacenado para actualizar el tipo de matrícula
        await pool.query('CALL sp_actualizar_tipo_matricula(?, ?)', [p_cod_tipo_matricula, Tipo]);
        res.status(200).json({ Mensaje: 'Tipo de matrícula actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar tipo de matrícula:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};


// Controlador para eliminar un tipo de matrícula
export const eliminarTipoMatricula = async (req, res) => {
    const { p_cod_tipo_matricula } = req.params; // Obtenemos el código del tipo a eliminar

    try {
        // Llamada al procedimiento almacenado para eliminar un tipo de matrícula
        await pool.query('CALL sp_eliminar_tipo_matricula(?)', [p_cod_tipo_matricula]);
        res.status(200).json({ Mensaje: 'Tipo de matrícula eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar tipo de matrícula:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para consultar tipos de matrícula
export const consultarTipoMatricula = async (req, res) => {
    const { p_cod_tipo_matricula } = req.params; // Obtenemos el código del tipo desde los parámetros de la ruta

    try {
        let query;
        let params;

        // Verificamos si se proporcionó un código de tipo de matrícula
        if (p_cod_tipo_matricula) {
            query = 'CALL sp_consultar_tipo_matricula(?)'; // Consulta un tipo específico
            params = [p_cod_tipo_matricula];
        } else {
            query = 'CALL sp_consultar_tipo_matricula(NULL)'; // Consulta todos los tipos
            params = [null];
        }

        const [results] = await pool.query(query, params);

        // Verificamos si hay resultados
        if (!results || results[0].length === 0) {
            return res.status(404).json({ Mensaje: 'Tipo de matrícula no encontrado' });
        }

        res.status(200).json(results[0]); // Retornamos los resultados
    } catch (error) {
        console.error('Error al consultar tipos de matrícula:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
