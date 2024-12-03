import express from 'express';
import {
    obtenerAsignaturas,
    crearAsignatura,
    actualizarAsignatura,
    eliminarAsignatura,
    obtenerAsignaturasPorProfesor
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

//-------------------------------------------Parite Ariel----------------------------------------------------------------
// Endpoint para obtener asignaturas por profesor y sección
router.get('/porprofesor/:codSeccion', obtenerAsignaturasPorProfesor);

export default router;
