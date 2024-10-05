import express from 'express';
import {
    obtenerAsistencias,
    crearAsistencia,
    actualizarAsistencia,
    eliminarAsistencia
} from '../Controller/asistenciaController.js'; // Importamos las funciones del controlador

const router = express.Router();

// Ruta para obtener todas las asistencias
router.get('/asistencias', obtenerAsistencias);

// Ruta para crear una nueva asistencia
router.post('/crearasistencias', crearAsistencia);

// Ruta para actualizar una asistencia
router.put('/actualizarasistencias', actualizarAsistencia);

// Ruta para eliminar una asistencia
router.delete('/eliminarasistencias', eliminarAsistencia);

export default router;
