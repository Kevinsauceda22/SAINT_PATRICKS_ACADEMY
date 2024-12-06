// Archivo: seccionesRoutes.js
import express from 'express';
import { getDetallePorPeriodo, 
         getTodasAgrupaciones,
         obtenerPeriodos,
         obtenerSeccionesPorPeriodo, 
         insertarAgrupador, 
} from '../Controllers/gestion_academicaController.js';

const router = express.Router();

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

export default router;