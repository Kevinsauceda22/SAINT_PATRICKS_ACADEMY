import express from 'express';
import { crearPago } from '../Controllers/pagosFinanzas.js';
import checkAuth from '../../../middleware/Auth_middleware.js'; // Ajusta la ruta según tu estructura

const router = express.Router();

// Asegúrate de usar el middleware aquí
router.post('/', checkAuth, crearPago); // Esta es la ruta donde aplicas el middleware

export default router;
