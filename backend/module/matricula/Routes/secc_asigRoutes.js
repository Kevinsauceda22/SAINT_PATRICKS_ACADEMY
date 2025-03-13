import express from 'express';
import { obtenerDetalleSeccionAsignatura, 
         obtenerSecciones, 
         obtenerDias, 
         obtenerGradosAsignaturas,
         actualizarSeccionAsignatura, 
         obtenerAsignaturasyHorarios,
         obtenerAsignaturasPorSeccionYGrado,
         getDetalleSeccionAsignatura, 
         obtenerAsignaturasPorGradoYSeccion
} from '../Controllers/secc_asigController.js';

const router = express.Router();

// Ruta para obtener todas las secciones y asignaturas o una específica
router.get('/obtener_seccion_asig/:Cod_seccion_asignatura?', obtenerDetalleSeccionAsignatura);

// Ruta para obtener secciones
router.get('/secciones/:Cod_grado/:Cod_periodo_matricula', obtenerSecciones);

// Ruta para obtener secciones
router.get('/dias', obtenerDias);

// Ruta para obtener secciones
router.get('/grados_asignaturas', obtenerGradosAsignaturas);

// Ruta para actualizar una sección
router.put('/actualizar_seccion_asig', actualizarSeccionAsignatura);

// Ruta para obtener secciones
router.get('/asignaturashorarios/:cod_seccion', obtenerAsignaturasyHorarios);

// Ruta para obtener secciones por el momento no
router.get('/asignaturasgrados/:Cod_secciones', obtenerAsignaturasPorSeccionYGrado);

// Detalles
router.get('/detalle/:Cod_seccion_asignatura', getDetalleSeccionAsignatura);

// Ruta 
router.get('/asignaturas/:Cod_seccion?', obtenerAsignaturasPorGradoYSeccion);

export default router;