import express from 'express';
import { obtenerActividades,obtenerHijosPorToken  }
 from '../Controller/actividades_AcademicasPadreController.js'; // Importamos las funciones del controlador

const router = express.Router();

// Ruta para verificar estado de pagos

// Ruta para obtener calificaciones
router.get('/actividadesAcademicasPadre/:codPersona', obtenerActividades);

// Ruta para obtener los hijos de un padre autenticado
router.get('/hijos', obtenerHijosPorToken);

export default router;
