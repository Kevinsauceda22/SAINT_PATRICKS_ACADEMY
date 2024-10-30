// libroDiarioController.js
import conectarDB from '../../config/db.js';

const pool = await conectarDB();

// Función para agregar un nuevo registro en el libro diario
export const agregarRegistro = async (req, res) => {
    const { Fecha, Descripcion, Cod_cuenta, Monto, Tipo_transaccion } = req.body;
    try {
        const [result] = await pool.query('CALL sp_agregar_libro_diario(?, ?, ?, ?, ?)', [Fecha, Descripcion, Cod_cuenta, Monto, Tipo_transaccion]);
        res.status(201).json({ cod_libro_diario: result[0].Cod_libro_diario });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agregar el registro en el libro diario' });
    }
};

// Función para editar un registro en el libro diario
export const editarRegistro = async (req, res) => {
    const { cod_libro_diario } = req.params;
    const { Fecha, Descripcion, Cod_cuenta, Monto, Tipo_transaccion } = req.body;

    // Agregar un log para verificar los valores que se están pasando
    console.log('Actualizando registro con:', {
        cod_libro_diario,
        Fecha,
        Descripcion,
        Cod_cuenta,
        Monto,
        Tipo_transaccion
    });

    try {
        await pool.query('CALL sp_editar_libro_diario(?, ?, ?, ?, ?, ?)', [cod_libro_diario, Fecha, Descripcion, Cod_cuenta, Monto, Tipo_transaccion]);
        res.status(200).json({ message: 'Registro actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al editar el registro en el libro diario' });
    }
};

// Función para eliminar un registro del libro diario
export const eliminarRegistro = async (req, res) => {
    const { cod_libro_diario } = req.params; // Obtener el cod_libro_diario desde los parámetros de la solicitud

    try {
        await pool.query('CALL sp_eliminar_libro_diario(?)', [cod_libro_diario]);
        res.status(200).json({ message: 'Registro eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el registro en el libro diario' });
    }
};

// Función para obtener todos los registros del libro diario
export const obtenerRegistros = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tbl_libro_diario');
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener los registros del libro diario' });
    }
};

export default {
    agregarRegistro,
    editarRegistro,
    eliminarRegistro,
    obtenerRegistros
};
