// routes/bitacoraRoutes.js
import express from 'express';
import { checkAuth } from '../../middleware/Auth_middleware.js';
import { 
    registrarBitacora,
    obtenerReporte,
    obtenerObjetos 
} from '../auth/bitacora_controller.js';

const router = express.Router();

// Ruta para registrar en bitácora
router.post('/registro', checkAuth, registrarBitacora);

// Ruta para obtener el reporte de actividades
router.get('/reporte', checkAuth, obtenerReporte);

// Ruta para obtener la lista de objetos
router.get('/objetos', checkAuth, obtenerObjetos);

export default router;