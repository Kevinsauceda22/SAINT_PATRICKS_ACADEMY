// Archivo: seccionesRoutes.js
import express from 'express';
import { obtenerAgrupadores,
         getDetallePorPeriodo, 
         getTodasAgrupaciones,
         obtenerPeriodos,
         obtenerSeccionesPorPeriodo, 
         insertarAgrupador, 
         obtenerSecciones,  
         obtenerPeriodoMatriculaActivo, 
} from '../Controllers/gestion_academicaController.js';

const router = express.Router();

// Ruta para obtener todas los agrupadores
router.get('/obtener_total', obtenerAgrupadores);

// Ruta para obtener detalle
router.get('/detalle/:Cod_periodo_matricula', getDetallePorPeriodo);

// Ruta para obtener agrupadores con estado
router.get('/obtenerTodasAgrupaciones', getTodasAgrupaciones);

// Ruta para obtener todas los agrupadores
router.get('/obtener_periodo', obtenerPeriodos);

// Ruta para obtener las secciones por el código del periodo de matrícula
router.get('/secciones_por_periodo/:Cod_periodo_matricula', obtenerSeccionesPorPeriodo);

// Ruta para crear una nuevo agrupador
router.post('/crear_agrupador', insertarAgrupador);

//Rutas de secciones:

// Ruta para obtener todas las secciones o una específica
router.get('/obtener_seccion/:Cod_seccion', obtenerSecciones);

// Ruta para obtener el periodo de matrícula activo
router.get('/periodo_academico/activo', obtenerPeriodoMatriculaActivo);

export default router;