import express from 'express';
import {
    obtenerNotas,
    crearNota,
    actualizarNota,
    eliminarNota
} from '../Controller/notaController.js'; // Importamos las funciones del controlador

const router = express.Router();

// Ruta para obtener todas las notas
router.get('/notas', obtenerNotas);

// Ruta para crear una nueva nota
router.post('/crearnota', crearNota);

// Ruta para actualizar una nota
router.put('/actualizarnota', actualizarNota);


// Ruta para eliminar una nota
router.delete('/eliminarnota', eliminarNota);

export default router;
