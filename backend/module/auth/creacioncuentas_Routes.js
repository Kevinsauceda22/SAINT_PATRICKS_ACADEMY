import express from 'express';
import { 
    crearPersonaYUsuario,
    actualizarPasswordPrimerIngreso
} from '../auth/creacioncuentas_Controller.js';
import checkAuth from '../../middleware/Auth_middleware.js';

const router = express.Router();

// Rutas protegidas - requieren autenticación y permisos
router.post('/crear-usuario', 
    checkAuth,
    crearPersonaYUsuario
);

// Ruta para actualizar contraseña temporal
router.put('/actualizar-password-temporal',
    checkAuth,
    actualizarPasswordPrimerIngreso
);

// Ruta base: /api/personas
export default router;