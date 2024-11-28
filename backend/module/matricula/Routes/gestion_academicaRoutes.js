// Archivo: seccionesRoutes.js
import express from 'express';
import { obtenerAgrupadores,getDetallePorPeriodo, getTodasAgrupaciones,obtenerPeriodos,obtenerSeccionesPorPeriodo, insertarAgrupador, obtenerSecciones, obtenerEdificios, obtenerEdificioPorId, obtenerAulasPorEdificio, obtenerAulas, obtenerGrados, obtenerProfesores, obtenerPeriodoMatriculaActivo, crearSeccion, actualizarSeccion, eliminarSeccion } from '../Controllers/gestion_academicaController.js';

const router = express.Router();

// Ruta para obtener todas los agrupadores
router.get('/obtener_total', obtenerAgrupadores);

// Ruta para crear una nuevo agrupador
router.post('/crear_agrupador', insertarAgrupador);

// Ruta para obtener todas los agrupadores
router.get('/obtener_periodo', obtenerPeriodos);

// Ruta para obtener las secciones por el código del periodo de matrícula
router.get('/secciones_por_periodo/:Cod_periodo_matricula', obtenerSeccionesPorPeriodo);

// Ruta para obtener agrupadores con estado
router.get('/obtenerTodasAgrupaciones', getTodasAgrupaciones);

router.get('/detalle/:Cod_periodo_matricula', getDetallePorPeriodo);


///////////////////////////////////////////////////
//Rutas de secciones:
//////////////////////////////////////////////////
// Ruta para obtener todas las secciones o una específica
router.get('/obtener_seccion/:Cod_seccion', obtenerSecciones);

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
router.get('/periodo_academico/activo', obtenerPeriodoMatriculaActivo);

// Ruta para crear una nueva sección
router.post('/crear_seccion', crearSeccion);

// Ruta para actualizar una sección
router.put('/actualizar_seccion', actualizarSeccion);

// Ruta para eliminar una sección
router.delete('/eliminar_seccion/:Cod_seccion', eliminarSeccion);

export default router;
