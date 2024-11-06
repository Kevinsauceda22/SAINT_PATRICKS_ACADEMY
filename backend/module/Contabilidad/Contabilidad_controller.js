// catalogoCuentasController.js
import conectarDB from '../../config/db.js';

const pool = await conectarDB();

// Función para agregar una nueva cuenta
export const agregarCuenta = async (req, res) => {
    const { nombre_cuenta, descripcion, tipo, naturaleza_cuenta, estado_sf, nivel } = req.body;
    try {
    const { nombre_cuenta, descripcion, tipo, naturaleza_cuenta, estado_sf, nivel } = req.body;
        const [result] = await pool.query('CALL sp_agregar_catalogo_cuenta(?, ?, ?, ?, ?, ?)', [nombre_cuenta, descripcion, tipo ,naturaleza_cuenta, estado_sf, nivel]);
        res.status(201).json({ cod_cuenta: result[0].cod_cuenta });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agregar la cuenta' });
    }
};

export const editarCuenta = async (req, res) => {
    const { cod_cuenta } = req.params;
    const { nombre_cuenta, descripcion, tipo, naturaleza_cuenta, estado_sf, nivel } = req.body;

    // Agregar un log para verificar los valores que se están pasando
    console.log('Actualizando cuenta con:', {
        cod_cuenta,
        nombre_cuenta,
        tipo,
        descripcion,
        naturaleza_cuenta,
        estado_sf,
        nivel
    });

    try {
        const [result] = await pool.query('CALL sp_editar_catalogo_cuenta(?, ?, ?, ?, ?, ?, ?)', [nombre_cuenta, descripcion, tipo, naturaleza_cuenta, estado_sf, nivel]);
        
        res.status(200).json({ message: 'Cuenta actualizada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al editar la cuenta' });
    }
};


// Función para eliminar una cuenta
// Función para eliminar una cuenta
export const eliminarCuenta = async (req, res) => {
    const { cod_cuenta } = req.params; // Obtener el cod_cuenta desde los parámetros de la solicitud

    try {
        const [result] = await pool.query('CALL sp_eliminar_catalogo_cuenta(?)', [cod_cuenta]);
        
        // Aquí puedes verificar si se eliminó correctamente (si es necesario)
        res.status(200).json({ message: 'Cuenta eliminada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar la cuenta' });
    }
};


// Función para obtener todas las cuentas
export const obtenerCuentas = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tbl_catalogo_cuentas');
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las cuentas' });
    }
};
