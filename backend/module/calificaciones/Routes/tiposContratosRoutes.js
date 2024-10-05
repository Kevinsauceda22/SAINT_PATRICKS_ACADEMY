import express from 'express';
import {
    obtenerTiposContrato,
    crearTipoContrato,
    actualizarTipoContrato
} from '../Controller/tiposContratoController.js'; 

const router = express.Router();

// Ruta para obtener todos los tipos de contrato
router.get('/tiposContrato', obtenerTiposContrato);

// Ruta para crear un nuevo tipo de contrato
router.post('/creartiposContrato', crearTipoContrato);

// Ruta para actualizar un tipo de contrato
router.put('/actualizartiposContrato', actualizarTipoContrato);

export default router;
