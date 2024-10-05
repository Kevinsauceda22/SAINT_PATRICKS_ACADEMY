import express from 'express';
import {
    obtenerProfesores,
    crearProfesor,
    actualizarProfesor
} from '..//Controller/profesoresController.js'; // Importa el controlador

const router = express.Router();

// Ruta para obtener todos los profesores
router.get('/verprofesores', obtenerProfesores);

// Ruta para crear un nuevo profesor
router.post('/crearprofesor', crearProfesor);

// Ruta para actualizar un profesor
router.put('/actualizarprofesor', actualizarProfesor);

export default router;
