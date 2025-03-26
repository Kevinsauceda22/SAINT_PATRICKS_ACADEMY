import express from 'express';
import {
        obtenerTodoTipoPersona,
        crearTipoPersona,
        actualizarTipoPersona,
        actualizarEstadoTipoPersona,
        eliminarTipoPersona
} from '../Controllers/tipoPersonaController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router();

// Ruta para obtener todas los tipos de persona
router.get('/verTodoTipoPersona', obtenerTodoTipoPersona);

// Ruta para crear un tipo de persona
router.post('/crearTipoPersona', crearTipoPersona);

// Ruta para actualizar un tipo de persona
router.put('/actualizarTipoPersona/:Cod_tipo_persona', actualizarTipoPersona);

// Ruta para actualizar el estado de un tipo de persona
router.post('/actualizarEstadoTipoPersona', actualizarEstadoTipoPersona);

// Ruta para eliminar un tipo de persona
router.delete('/eliminarTipoPersona/:Cod_tipo_persona', eliminarTipoPersona);

export default router;
