import express from 'express';
import { obtenerDetalleSeccionAsignatura, obtenerSecciones, obtenerDias, obtenerGradosAsignaturas,crearHorarioSeccionAsignatura, actualizarSeccionAsignatura, obtenerAsignaturasyHorarios,obtenerAsignaturasPorSeccionYGrado,obtenerSeccionesPorGrado,obtenerAsignaturasPorProfesor,
    obtenerAsignaturasPorSeccion,getDetalleSeccionAsignatura} from '../Controllers/secc_asigController.js';

const router = express.Router();

// Ruta para obtener todas las secciones y asignaturas o una específica
router.get('/obtener_seccion_asig/:Cod_seccion_asignatura?', obtenerDetalleSeccionAsignatura);

// Ruta para obtener secciones
router.get('/secciones/:Cod_grado/:Cod_periodo_matricula', obtenerSecciones);

// Ruta para obtener secciones
router.get('/dias', obtenerDias);

// Ruta para obtener secciones
router.get('/grados_asignaturas', obtenerGradosAsignaturas);

// Ruta para crear una nueva sección y asignatura
router.post('/crear_seccion_asig', crearHorarioSeccionAsignatura);

// Ruta para actualizar una sección
router.put('/actualizar_seccion_asig', actualizarSeccionAsignatura);

// Ruta para obtener secciones
router.get('/asignaturashorarios/:cod_seccion', obtenerAsignaturasyHorarios);

// Ruta para obtener secciones por el momento no
router.get('/asignaturasgrados/:Cod_secciones', obtenerAsignaturasPorSeccionYGrado);

// Ruta para obtener secciones
router.get('/gradosasig/:Cod_grado', obtenerSeccionesPorGrado);

router.get('/detalle/:Cod_seccion_asignatura', getDetalleSeccionAsignatura);

// Ruta para obtener las asignaturas por codSeccion y profesor
router.get('/verseccionesasignaturas/:codSeccion', obtenerAsignaturasPorProfesor);

// Definir la ruta para obtener asignaturas por sección
router.get('/porseccion/:codSeccion', obtenerAsignaturasPorSeccion);


export default router;
