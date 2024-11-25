// routes/dashboardRoutes.js
import express from 'express';
import checkAuth from '../../middleware/Auth_middleware.js';
import {
  obtenerEstadisticas,
  obtenerMatriculasPorGrado,
  obtenerUltimasMatriculas
} from '../dashboard/dashboardController.js';

const router = express.Router();

// Ruta para obtener estadísticas generales
router.get('/stats', checkAuth, obtenerEstadisticas);

// Ruta para obtener matrículas por grado
router.get('/matriculas-por-grado', checkAuth, obtenerMatriculasPorGrado);

// Ruta para obtener últimas matrículas
router.get('/ultimas-matriculas', checkAuth, obtenerUltimasMatriculas);

export default router;