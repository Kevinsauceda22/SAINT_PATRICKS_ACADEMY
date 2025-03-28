import express from 'express';
import {
        obtenerTodoGeneroPersona,
        crearGeneroPersona,
        actualizarGeneroPersona,
        actualizarEstadoGeneroPersona,
        eliminarGeneroPersona
} from '../Controllers/generoPersonaController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router();

// Ruta para obtener todos los géneros de persona
router.get('/verTodoGeneroPersona', obtenerTodoGeneroPersona);

// Ruta para crear género de persona
router.post('/crearGeneroPersona', crearGeneroPersona);

// Ruta para actualizar género de persona
router.put('/actualizarGeneroPersona/:cod_genero', actualizarGeneroPersona);

// Ruta para actualizar el estado de un género de persona
router.post('/actualizarEstadoGeneroPersona', actualizarEstadoGeneroPersona);

// Ruta para eliminar un género de persona
router.delete('/eliminarGeneroPersona/:cod_genero', eliminarGeneroPersona);

export default router;
