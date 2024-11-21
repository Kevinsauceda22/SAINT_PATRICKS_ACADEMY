import express from 'express';
import {
    obtenerActividadesAcademicas,
    actualizarActividadAcademica ,
    getActividadesPorProfesor,
    eliminarActividadAcademica,
    obtenerActividadesPorSeccionAsignatura,
    crearActividadPorAsignatura    ,
    obtenerActividadesPorAsignatura,
    registrarActividadPorAsignatura 
} from '../Controller/activiades_AcademicasController.js'; // Importamos las funciones del controlador

const router = express.Router();

// Ruta para obtener todas las actividades académicas
router.get('/veractividades', obtenerActividadesAcademicas);

// Ruta para actualizar una actividad académica
router.put('/actualizar/:id', actualizarActividadAcademica);

// Ruta para obtener las actividades por Cod_profesor
router.get('/veractividadesProfesor/:Cod_profesor', getActividadesPorProfesor);

router.delete('/eliminarActividad', eliminarActividadAcademica);

// Ruta protegida por token para obtener actividades
router.get('/obtenerActividades/:codSeccionAsignatura', obtenerActividadesPorSeccionAsignatura);

// Agrega la ruta correspondiente
router.post('/crear-actividad', crearActividadPorAsignatura);

// Ruta para obtener actividades por asignatura
router.get('/porasignatura/:codAsignatura', obtenerActividadesPorAsignatura);

// Ruta para crear una nueva actividad por asignatura
router.post('/registrar', registrarActividadPorAsignatura);


export default router;
