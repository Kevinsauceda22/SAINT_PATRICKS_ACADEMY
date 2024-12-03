import express from 'express';
import {
    crearConceptoPago,
    actualizarConceptoPago,
    eliminarConceptoPago,
    obtenerConceptoPago
} from '../Controllers/conceptopagoController.js';

const router = express.Router();

// Crear un concepto de pago
router.post('/concepto-pago', crearConceptoPago);

// Actualizar un concepto de pago
router.put('/concepto-pago/:p_Cod_concepto', actualizarConceptoPago);

// Eliminar un concepto de pago
router.delete('/concepto-pago/:Cod_concepto', eliminarConceptoPago);

// Ruta para obtener todos los conceptos de pago o un concepto específico
router.get('/concepto-pago/:Cod_concepto?', obtenerConceptoPago); // El ? hace que el parámetro sea opcional

export default router;
