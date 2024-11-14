// Función para agregar un nuevo registro en el libro diario
export const agregarRegistro = async (req, res) => {
    const { Fecha, Descripcion, Cod_cuenta, Monto, Tipo } = req.body;

    // Verificar que todos los campos estén presentes
    if (!Fecha || !Descripcion || !Cod_cuenta || !Monto || !Tipo) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    try {
        await initDB();  // Inicializar la base de datos si no está inicializada
        // Ejecutamos el procedimiento almacenado
        const [result] = await pool.query('CALL sp_agregar_libro_diario(?, ?, ?, ?, ?)', [Fecha, Descripcion, Cod_cuenta, Monto, Tipo]);

        // Devolver la respuesta con el código del libro diario agregado
        res.status(201).json({ cod_libro_diario: result[0].Cod_libro_diario });
    } catch (error) {
        console.error('Error al agregar el registro:', error);
        res.status(500).json({ error: 'Error al agregar el registro en el libro diario' });
    }
};

// Función para editar un registro del libro diario
export const editarRegistro = async (req, res) => {
    const { cod_libro_diario } = req.params;
    const { Fecha, Descripcion, Cod_cuenta, Monto, Tipo } = req.body;

    // Verificar que todos los campos estén presentes
    if (!Fecha || !Descripcion || !Cod_cuenta || !Monto || !Tipo) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    try {
        await initDB();  // Inicializar la base de datos si no está inicializada
        // Ejecutar el procedimiento almacenado para editar el libro diario
        await pool.query('CALL sp_editar_libro_diario(?, ?, ?, ?, ?, ?)', [cod_libro_diario, Fecha, Descripcion, Cod_cuenta, Monto, Tipo]);
        res.status(200).json({ message: 'Registro actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar el registro:', error);
        res.status(500).json({ error: 'Error al editar el registro en el libro diario' });
    }
};

// Función para eliminar un registro del libro diario
export const eliminarRegistro = async (req, res) => {
    const { Cod_libro_diario } = req.params;

    try {
        await initDB();  // Inicializar la base de datos si no está inicializada
        // Ejecutamos el procedimiento almacenado para eliminar el registro
        await pool.query('CALL sp_eliminar_libro_diario(?)', [Cod_libro_diario]);
        res.status(200).json({ message: 'Registro eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el registro:', error);
        res.status(500).json({ error: 'Error al eliminar el registro en el libro diario' });
    }
};

// Función para obtener todos los registros del libro diario
export const obtenerRegistros = async (req, res) => {
    try {
        await initDB();  // Inicializar la base de datos si no está inicializada
        const [rows] = await pool.query('SELECT * FROM tbl_libro_diario');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener los registros:', error);
        res.status(500).json({ error: 'Error al obtener los registros del libro diario' });
    }
};

export default {
    agregarRegistro,
    editarRegistro,
    eliminarRegistro,
    obtenerRegistros
};