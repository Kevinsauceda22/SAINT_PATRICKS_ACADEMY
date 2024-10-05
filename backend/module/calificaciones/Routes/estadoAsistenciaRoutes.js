import express from 'express';
import {
    obtenerEstadoAsistencias,
    crearEstadoAsistencia,
    actualizarEstadoAsistencia,
    eliminarEstadoAsistencia
} from '../Controller/estadoAsistenciaController.js'; // Importamos las funciones del controlador

const router = express.Router();

// Ruta para obtener todos los estados de asistencia
router.get('/estadoasistencias', obtenerEstadoAsistencias);

// Ruta para crear un nuevo estado de asistencia
router.post('/crearestadoasistencias', crearEstadoAsistencia);

// Ruta para actualizar un estado de asistencia
router.put('/actualizarestadoasistencias', actualizarEstadoAsistencia);

// Ruta para eliminar un estado de asistencia
router.delete('/eliminarestadoasistencias', eliminarEstadoAsistencia);

export default router;
