import express from 'express';
import {
    crearTipoPersona,
    actualizarTipoPersona,
    eliminarTipoPersona,
    obtenerTipoPersona
} from '../Controllers/tipopersonaController.js';

const router = express.Router();

// Crear un nuevo tipo de persona
router.post('/tipo-persona', crearTipoPersona);

// Actualizar un tipo de persona
router.put('/tipo-persona/:Cod_tipo_persona', actualizarTipoPersona);

// Eliminar un tipo de persona
router.delete('/tipo-persona/:Cod_tipo_persona', eliminarTipoPersona);

// Obtener todos los tipos de persona o uno específico
router.get('/tipo-persona/:Cod_tipo_persona?', obtenerTipoPersona); // El ? hace que el parámetro sea opcional

export default router;
