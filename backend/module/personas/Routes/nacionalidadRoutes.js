import express from 'express';
import {
        obtenerTodoNacionalidad,
        crearNacionalidad,
        actualizarNacionalidad,
        actualizarEstadoNacionalidad,
        eliminarNacionalidad
} from '../Controllers/nacionalidadController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router();

// Ruta para obtener todas las nacionalidades
router.get('/verTodoNacionalidad', obtenerTodoNacionalidad);

// Ruta para crear una nacionalidad
router.post('/crearNacionalidad', crearNacionalidad);

// Ruta para actualizar una nacionalidad
router.put('/actualizarNacionalidad/:cod_nacionalidad', actualizarNacionalidad);

// Ruta para actualizar el estado de una nacionalidad
router.post('/actualizarEstadoNacionalidad', actualizarEstadoNacionalidad);

// Ruta para eliminar una nacionalidad
router.delete('/eliminarNacionalidad/:cod_nacionalidad', eliminarNacionalidad);

export default router;
