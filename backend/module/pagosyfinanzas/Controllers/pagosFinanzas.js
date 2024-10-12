import db from "../../../config/db.js"; // Asegúrate de que esta ruta apunte a tu configuración de base de datos

// Crear un nuevo pago
export const crearPago = (req, res) => {
    // Obtener el cod_persona del usuario logueado
    const cod_persona = req.usuario.cod_persona; // Asegúrate de que esto es correcto según tu estructura

    const { monto, metodo_pago, descripcion, cod_matricula, cod_caja, cod_concepto } = req.body;

    // Validar que todos los campos necesarios estén presentes
    if (!monto || !metodo_pago || !cod_matricula || !cod_caja || !cod_concepto) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    // Insertar en tbl_historial_pago
    const sql = `
        INSERT INTO tbl_historial_pago (Cod_persona, Monto, Fecha_pago, Metodo_pago, Descripcion, Cod_matricula, Cod_caja, Cod_concepto)
        VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)`;

    db.query(sql, [cod_persona, monto, metodo_pago, descripcion, cod_matricula, cod_caja, cod_concepto], (error, results) => {
        if (error) {
            console.error('Error al registrar el pago:', error); // Para debug
            return res.status(500).json({ error: 'Error al registrar el pago.', detalles: error.message });
        }

        res.status(201).json({ message: 'Pago registrado exitosamente.', pagoId: results.insertId });
    });
};
