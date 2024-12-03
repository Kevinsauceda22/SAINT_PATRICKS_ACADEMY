import conectarDB from '../../../config/db.js';

const pool = await conectarDB();


// Controlador para crear un concepto de pago
export const crearConceptoPago = async (req, res) => {
    const { concepto, descripcion, activo } = req.body;

    // Validar que el concepto no sea NULL
    if (!concepto) {
        return res.status(400).json({ Mensaje: 'El concepto no puede ser NULL' });
    }

    // Solo se permiten los estados "Si" o "No"
    const estadosValidos = ['Si', 'No'];
    if (!estadosValidos.includes(activo)) {
        return res.status(400).json({ Mensaje: 'Estado inválido. Los estados permitidos son: ' + estadosValidos.join(', ') });
    }

    try {
        // Llamada al procedimiento almacenado para insertar un concepto de pago
        await pool.query('CALL InsertarConceptoPago(?, ?, ?)', [
            concepto,
            descripcion,
            activo
        ]);

        res.status(201).json({ Mensaje: 'Concepto de pago creado exitosamente' });
    } catch (error) {
        console.error('Error al crear el concepto de pago:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
// Obtener todos los conceptos de pago o un concepto específico por Cod_concepto
export const obtenerConceptoPago = async (req, res) => {
    const { Cod_concepto } = req.params;

    try {
        let query;
        let params;

        if (Cod_concepto) {
            query = 'CALL ObtenerConceptoPago(?)'; // Para obtener un concepto específico
            params = [Cod_concepto];
        } else {
            query = 'CALL ObtenerConceptoPago(NULL)'; // Para obtener todos los conceptos
            params = [null];
        }

        const [results] = await pool.query(query, params);

        // Verificar si hay resultados
        if (!results || results[0].length === 0) {
            return res.status(404).json({ message: 'Concepto de pago no encontrado' });
        }

        res.status(200).json(results[0]);
    } catch (error) {
        console.error('Error al obtener el concepto de pago:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
export const actualizarConceptoPago = async (req, res) => {
    const { p_Cod_concepto } = req.params;  // Obtenemos el código del concepto desde los parámetros
    const { Concepto, Descripcion, Activo } = req.body;  // Obtenemos los nuevos valores desde el cuerpo de la solicitud

    // Verificar que el código del concepto sea válido
    if (!p_Cod_concepto) {
        return res.status(400).json({ Mensaje: 'El código del concepto es requerido.' });
    }

    // Verificar que los valores de entrada sean válidos
    const estadosValidos = ['Si', 'No'];
    if (!estadosValidos.includes(Activo)) {
        return res.status(400).json({
            Mensaje: 'El valor de "Activo" es inválido. Los valores permitidos son: ' + estadosValidos.join(', ')
        });
    }

    try {
        // Llamada al procedimiento almacenado para actualizar el concepto de pago
        await pool.query('CALL ActualizarConceptoPago(?, ?, ?, ?)', [p_Cod_concepto, Concepto, Descripcion, Activo]);
        res.status(200).json({ Mensaje: 'Concepto de pago actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar concepto de pago:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para eliminar un concepto de pago
export const eliminarConceptoPago = async (req, res) => {
    const { Cod_concepto } = req.params;

    try {
        await pool.query('CALL EliminarConceptoPago(?)', [
            Cod_concepto
        ]);

        res.status(200).json({ Mensaje: 'Concepto de pago eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el concepto de pago:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
