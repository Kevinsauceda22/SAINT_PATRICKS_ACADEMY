import express from 'express';
import { 
    obtenerSecciones,
    obtenerAulas,
    obtenerGrados,
    obtenerProfesores,
    obtenerPeriodoMatriculaActivo,
    crearSeccion,
    actualizarSeccion,
    eliminarSeccion,
    obtenerEdificios,
    obtenerAulasPorEdificio,
    obtenerEdificioPorId 
} from '../Controllers/seccionesController.js';

const router = express.Router();

// Ruta para obtener todas las secciones o una específica
router.get('/versecciones/:Cod_secciones?', obtenerSecciones);

// Ruta para obtener todos los edificios
router.get('/edificios', obtenerEdificios);

// Ruta para obtener un edificio específico por Cod_edificio
router.get('/edificios/:Cod_edificio', obtenerEdificioPorId);

// Ruta para obtener aulas filtradas por edificio
router.get('/aulas/por_edificio/:Cod_edificio', obtenerAulasPorEdificio);

// Ruta para obtener todas las aulas
router.get('/aulas', obtenerAulas);

// Ruta para obtener grados
router.get('/grados', obtenerGrados);

// Ruta para obtener profesores
router.get('/profesores', obtenerProfesores);

// Ruta para obtener el periodo de matrícula activo
router.get('/periodo_academico/activo', obtenerPeriodoMatriculaActivo);

// Ruta para crear una nueva sección
router.post('/crear_seccion', crearSeccion);

// Ruta para actualizar una sección
router.put('/actualizar_seccion', actualizarSeccion);

// Ruta para eliminar una sección
router.delete('/eliminar_seccion/:Cod_seccion', eliminarSeccion);

// Exportación del router
export { router as default };