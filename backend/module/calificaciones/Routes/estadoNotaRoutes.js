import express from 'express';
import {
    obtenerEstadoNota,
    crearEstadoNota,
    actualizarEstadoNota,
    eliminarEstadoNota
} from '../Controller/estadoNotaController.js'; // Importamos las funciones del controlador

const router = express.Router();

// Ruta para obtener todos los estados de nota
router.get('/estadonota', obtenerEstadoNota);

// Ruta para crear un nuevo estado de notaa
router.post('/crearestadonota', crearEstadoNota);

// Ruta para actualizar un estado de nota
router.put('/actualizarestadonota', actualizarEstadoNota);

// Ruta para eliminar un estado de nota
router.delete('/eliminarestadonota', eliminarEstadoNota);

export default router;
