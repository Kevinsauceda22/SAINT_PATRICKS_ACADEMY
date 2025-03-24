import express from 'express';
import {
    obtenerTodoProcedenciaEstudiante,
    crearProcedenciaEstudiante,
    actualizarProcedenciaEstudiante,
    eliminarProcedenciaEstudiante
} from '../Controllers/procedenciaEstudianteController.js';

const router = express.Router();

// Ruta para obtener todas las procedencias de estudiantes
router.get('/verTodoProcedenciaEstudiante', obtenerTodoProcedenciaEstudiante);

// Ruta para crear una nueva procedencia de estudiante
router.post('/crearProcedenciaEstudiante', crearProcedenciaEstudiante);

// Ruta para actualizar una procedencia de estudiante
router.put('/actualizarProcedenciaEstudiante/:Cod_procedencia_estudiante', actualizarProcedenciaEstudiante);

// Ruta para eliminar una procedencia de estudiante
router.delete('/eliminarProcedenciaEstudiante/:Cod_procedencia_estudiante', eliminarProcedenciaEstudiante);

export default router;
