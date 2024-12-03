// Archivo: seccionesRoutes.js
import express from 'express';
import { obtenerSecciones, obtenerEdificios,obtenerSeccionesPorProfesor,obtenerTodasLasSeccionesYProfesoresAdmin, obtenerPeriodoActivo,obtenerSeccionesPorPeriodo,obtenerEdificioPorId, obtenerAulasPorEdificio, obtenerAulas, obtenerGrados, obtenerProfesores, obtenerPeriodos, crearSeccion, actualizarSeccion, eliminarSeccion } from '../Controllers/seccionesController.js';
const router = express.Router();

// Ruta para obtener todas las secciones 
router.get('/obtener_secciones/:Cod_secciones?', obtenerSecciones);

// Ruta para obtener todas las secciones por el cod_periodo_matricula
router.get('/obtener_seccperiodo/:Cod_periodo_matricula?', obtenerSeccionesPorPeriodo);

// Ruta para obtener el período académico activo
router.get('/periodo_academico/activo', obtenerPeriodoActivo);

// Ruta para obtener todos los edificios
router.get('/edificios', obtenerEdificios);

// Ruta para obtener un edificio específico por Cod_edificio
router.get('/edificios/:Cod_edificio', obtenerEdificioPorId); 

// Ruta para obtener aulas filtradas por edificio
router.get('/aulas/por_edificio/:Cod_edificio', obtenerAulasPorEdificio);

// Ruta para obtener grados
router.get('/aulas', obtenerAulas);

// Ruta para obtener grados
router.get('/grados', obtenerGrados);

// Ruta para obtener profesores
router.get('/profesores', obtenerProfesores);

// Ruta para obtener el periodo de matrícula activo
router.get('/periodo_academico', obtenerPeriodos);

// Ruta para crear una nueva sección
router.post('/crear_seccion', crearSeccion);

// Ruta para actualizar una sección
router.put('/actualizar_seccion', actualizarSeccion);

// Ruta para eliminar una sección
router.delete('/eliminar_seccion/:Cod_seccion', eliminarSeccion);




//------------------------------------------------------------------------- Parte ariel-------------------------------------------------------------

// Ruta para obtener las secciones de un profesor usando el token
router.get('/porprofesor', obtenerSeccionesPorProfesor);

// Define la ruta para obtener las secciones por profesor
router.get('/porprofesor/:codProfesor', obtenerTodasLasSeccionesYProfesoresAdmin);
export default router;

