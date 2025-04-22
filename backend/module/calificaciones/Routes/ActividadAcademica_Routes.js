import express from 'express';
import {
   
    actualizarActividadAcademica ,
    eliminarActividadAcademica,
    obtenerActividadesPorSeccionAsignatura,
    crearActividadPorAsignatura    ,
    obtenerActividadesPorAsignatura,
    registrarActividadPorAsignatura,
    obtenerActividadesPorProfesorYAsignatura,
    obtenerActividadesPorFiltro ,
    obtenerPonderacionesPorProfesor,
    obtenerPonderacionesPorProfesorAdmin,
    actualizarActividad,
    eliminarActividad,
    obtenerValoresPorPonderacionCiclo  ,
    validarValorActividad,
    validarYActualizarActividad,
    obtenerParcialesPorAsignatura,
    obtenerActividadesPorParcialAsignatura
} from '../Controller/activiades_AcademicasController.js'; // Importamos las funciones del controlador

const router = express.Router();


// Ruta para actualizar una actividad académica
router.put('/actualizar/:id', actualizarActividadAcademica);

// Ruta para actualizar una actividad académica
router.put('/:id', actualizarActividad );
// Ruta para actualizar una actividad académica
router.delete('/eliminar/:id', eliminarActividad );

router.delete('/:id', eliminarActividadAcademica);

// Ruta protegida por token para obtener actividades
router.get('/obtenerActividades/:codSeccionAsignatura', obtenerActividadesPorSeccionAsignatura);

// Agrega la ruta correspondiente
router.post('/crear-actividad', crearActividadPorAsignatura);

// Ruta para obtener actividades por asignatura
router.get('/porasignatura/:codAsignatura', obtenerActividadesPorAsignatura);

// Ruta para crear una nueva actividad por asignatura
router.post('/registrar', registrarActividadPorAsignatura);

// Ruta para obtener actividades por profesor y asignatura
router.get('/porProfesorYAsignatura/:Cod_profesor/:Cod_grados_asignaturas/:Cod_parcial/:Cod_seccion', obtenerActividadesPorProfesorYAsignatura);

router.get('/actividadesporparcialseccion', obtenerActividadesPorFiltro);

router.get('/obtenerPonderacionesPorProfesor/:codSeccion', obtenerPonderacionesPorProfesor);

router.get('/obtenerPonderacionesPorProfesoradmin/:codProfesor/:codSeccion', obtenerPonderacionesPorProfesorAdmin);

// Ruta para obtener valores disponibles
router.get("/valoresPorPonderacionCiclo", obtenerValoresPorPonderacionCiclo);


// Ruta para validar valor de actividad
router.post('/validar-valor', validarValorActividad);
// Ruta para validar valor de actividad
router.post('/validar-valoractua', validarYActualizarActividad);

//////admin actividades
router.get('/parciales/:codAsignatura/:codSeccion', obtenerParcialesPorAsignatura);
router.get('/actividades/:codGradosAsignaturas/:codParcial/:codSeccion', obtenerActividadesPorParcialAsignatura);


export default router;