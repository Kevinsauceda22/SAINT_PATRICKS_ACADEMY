import conectarDB from '../../config/db.js';

// Crear una instancia de conexión de base de datos
const pool = await conectarDB();

// Agregar una nueva cuenta
export const agregarCuenta = async (req, res) => {
    const { nombre_cuenta, descripcion, tipo, naturaleza_cuenta, estado_sf, nivel } = req.body;

    if (!nombre_cuenta || !tipo || !naturaleza_cuenta || !estado_sf || !nivel) {
        return res.status(400).json({ error: 'Todos los campos obligatorios deben ser proporcionados' });
    }

    try {
        console.log('Ejecutando SP con parámetros:', [nombre_cuenta, descripcion, tipo, naturaleza_cuenta, estado_sf, nivel]);

        const [result] = await pool.query(
            'CALL sp_agregar_catalogo_cuenta(?, ?, ?, ?, ?, ?)',
            [nombre_cuenta, descripcion || '', tipo, naturaleza_cuenta, estado_sf, nivel]
        );

        if (result && result[0] && result[0][0] && result[0][0].cod_cuenta) {
            console.log('Resultado del SP:', result);
            res.status(201).json({
                message: 'Cuenta agregada exitosamente',
                cod_cuenta: result[0][0].cod_cuenta
            });
        } else {
            res.status(400).json({ error: 'No se pudo agregar la cuenta correctamente', details: 'El procedimiento almacenado no devolvió un código de cuenta válido' });
        }

    } catch (error) {
        console.error('Error en la base de datos:', error);
        res.status(500).json({ error: 'Error al agregar la cuenta', details: error.message, sqlMessage: error.sqlMessage });
    }
};

// Editar una cuenta
// Editar una cuenta
export const editarCuenta = async (req, res) => {
    const { cod_cuenta } = req.params;
    const { nombre_cuenta, descripcion, tipo, naturaleza_cuenta, estado_sf, nivel } = req.body;

    try {
        const [result] = await pool.query(
            'CALL sp_editar_catalogo_cuenta(?, ?, ?, ?, ?, ?, ?)',
            [cod_cuenta, nombre_cuenta, descripcion, tipo, naturaleza_cuenta, estado_sf, nivel]
        );

        // Verifica filas_afectadas directamente
        if (result && result[0] && result[0][0] && result[0][0].filas_afectadas > 0) {
            return res.status(200).json({ message: 'Cuenta actualizada correctamente' });
        } else {
            return res.status(404).json({ error: 'No se encontró la cuenta para actualizar' });
        }
        
    } catch (error) {
        console.error('Error al editar la cuenta:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


// Eliminar una cuenta
export const eliminarCuenta = async (req, res) => {
    const { cod_cuenta } = req.params;

    try {
        const [result] = await pool.query('CALL sp_eliminar_catalogo_cuenta(?)', [cod_cuenta]);

        if (result.affectedRows > 0) {
            res.status(200).json({ message: 'Cuenta eliminada correctamente' });
        } else {
            res.status(404).json({ error: 'No se encontró la cuenta para eliminar' });
        }

    } catch (error) {
        console.error('Error al eliminar cuenta:', error);
        res.status(500).json({ error: 'Error al eliminar la cuenta' });
    }
};

// Obtener todas las cuentas
export const obtenerCuentas = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM tbl_catalogo_cuentas');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al obtener cuentas:', error);
        res.status(500).json({ error: 'Error al obtener las cuentas' });
    }
};
