import conectarDB from "../../../config/db.js"; // Asegúrate de que esta ruta apunte a tu configuración de base de datos

const pool = await conectarDB(); // Suponiendo que conectarDB retorna un pool

// Crear un nuevo pago
export const crearPago = async (req, res) => {
    // Obtener el cod_usuario del usuario logueado
    const cod_usuario = req.usuario.cod_usuario; // Cambiado de cod_persona a cod_usuario

    const { monto, metodo_pago, descripcion, cod_matricula, cod_caja, cod_concepto } = req.body;

    // Validar que todos los campos necesarios estén presentes
    if (!monto || !metodo_pago || !cod_matricula || !cod_caja || !cod_concepto) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    // Insertar en tbl_historial_pago
    const sql = `
        INSERT INTO tbl_historial_pago (Cod_usuario, Monto, Fecha_pago, Metodo_pago, Descripcion, Cod_matricula, Cod_caja, Cod_concepto)
        VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)`;

    try {
        const [results] = await pool.query(sql, [cod_usuario, monto, metodo_pago, descripcion, cod_matricula, cod_caja, cod_concepto]);
        res.status(201).json({ message: 'Pago registrado exitosamente.', pagoId: results.insertId });
    } catch (error) {
        console.error('Error al registrar el pago:', error); // Para debug
        res.status(500).json({ error: 'Error al registrar el pago.', detalles: error.message });
    }
};
