import express from 'express';
import {
    obtenerPonderaciones,
    crearPonderacion,
    actualizarPonderacion,
    eliminarPonderacion
} from '../Controller/ponderacionesController.js'; // Importamos las funciones del controlador

const router = express.Router();

// Ruta para obtener todas las ponderaciones
router.get('/verPonderaciones', obtenerPonderaciones);

// Ruta para crear una nueva ponderación
router.post('/crearPonderacion', crearPonderacion);

// Ruta para actualizar una ponderación
router.put('/actualizarPonderacion', actualizarPonderacion);

// Ruta para eliminar una ponderación
router.delete('/eliminarPonderacion', eliminarPonderacion);

export default router;
