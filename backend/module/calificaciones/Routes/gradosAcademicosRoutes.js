import express from 'express';
import {
    obtenerGradosAcademicos,
    crearGradoAcademico,
    actualizarGradoAcademico,
    eliminarGradoAcademico
} from '../Controller/gradosAcademicosController.js'; // Importamos las funciones del controlador

const router = express.Router();

// Ruta para obtener todos los grados académicos
router.get('/verGradosAcademicos', obtenerGradosAcademicos);

// Ruta para crear un nuevo grado académico
router.post('/crearGradoAcademico', crearGradoAcademico);

// Ruta para actualizar un grado académico
router.put('/actualizarGradoAcademico', actualizarGradoAcademico);

// Ruta para eliminar un grado académico
router.delete('/eliminarGradoAcademico', eliminarGradoAcademico);

export default router;
