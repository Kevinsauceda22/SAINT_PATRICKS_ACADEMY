import express from 'express';
import { obtenerDetalleSeccionAsignatura, obtenerSecciones, obtenerDias, obtenerGradosAsignaturas,crearHorarioSeccionAsignatura, actualizarSeccionAsignatura} from '../Controllers/secc_asigController.js';

const router = express.Router();

// Ruta para obtener todas las secciones y asignaturas o una específica
router.get('/obtener_seccion_asig/:Cod_seccion_asignatura?', obtenerDetalleSeccionAsignatura);

// Ruta para obtener secciones
router.get('/secciones', obtenerSecciones);

// Ruta para obtener secciones
router.get('/dias', obtenerDias);

// Ruta para obtener secciones
router.get('/grados_asignaturas', obtenerGradosAsignaturas);

// Ruta para crear una nueva sección y asignatura
router.post('/crear_seccion_asig', crearHorarioSeccionAsignatura);

// Ruta para actualizar una sección
router.put('/actualizar_seccion_asig', actualizarSeccionAsignatura);


export default router;