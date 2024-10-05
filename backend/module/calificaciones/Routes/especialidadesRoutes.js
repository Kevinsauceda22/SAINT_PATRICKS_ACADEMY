import express from 'express';
import {
    obtenerEspecialidades,
    crearEspecialidad,
    actualizarEspecialidad,
    eliminarEspecialidad
} from '../Controller/especialidadesController.js'; // Importamos las funciones del controlador

const router = express.Router();

// Ruta para obtener todas las especialidades
router.get('/verEspecialidades', obtenerEspecialidades);

// Ruta para crear una nueva especialidad
router.post('/crearEspecialidad', crearEspecialidad);

// Ruta para actualizar una especialidad
router.put('/actualizarEspecialidad', actualizarEspecialidad);

// Ruta para eliminar una especialidad
router.delete('/eliminarEspecialidad', eliminarEspecialidad);

export default router;
