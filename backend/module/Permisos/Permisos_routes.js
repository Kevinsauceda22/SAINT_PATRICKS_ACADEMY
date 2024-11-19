import express from 'express';
import {
  obtenerPermisos,
  obtenerPermisoPorId,
  crearPermiso,
  actualizarPermiso,
  eliminarPermiso,
  cambiarEstadoPermiso
} from '../Permisos/Permisos_controller.js';
import checkAuth from '../../middleware/Auth_middleware.js'; // Importar middleware de autenticación

const router = express.Router();

// Proteger las rutas con checkAuth
router.get('/permisos', checkAuth, obtenerPermisos);
router.get('/permisos/:id', checkAuth, obtenerPermisoPorId);
router.post('/permisos', checkAuth, crearPermiso);
router.put('/permisos/:id', checkAuth, actualizarPermiso);
router.delete('/permisos/:id', checkAuth, eliminarPermiso);

router.put('/permisos/estado/:id', checkAuth, cambiarEstadoPermiso);


export default router;
