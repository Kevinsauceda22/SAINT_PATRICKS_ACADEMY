import express from 'express';
import {
    obtenerAsignaturas,
    crearAsignatura,
    actualizarAsignatura,
    eliminarAsignatura
} from '../Controller/asignaturasController.js'; // Importamos las funciones del controlador

const router = express.Router();

// Ruta para obtener todas las asignaturas
router.get('/verAsignaturas', obtenerAsignaturas);

// Ruta para crear una nueva asignatura
router.post('/crearAsignatura', crearAsignatura);

// Ruta para actualizar una asignatura
router.put('/actualizarAsignatura', actualizarAsignatura);

// Ruta para eliminar una asignatura
router.delete('/eliminar_asignatura', eliminarAsignatura);

export default router;
