import express from 'express';
import {
    crearUsuario,
    obtenerUsuarios,
    obtenerUsuarioPorId,
    actualizarUsuario,
    eliminarUsuario,
    confirmarCuenta,
    autenticarUsuario,
    mostrarPerfil,
} from './usuarios_controller.js';

import checkAuth from '../../middleware/Auth_middleware.js'; 
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Ruta para crear un nuevo usuario (no requiere autenticación)
router.post('/', crearUsuario);

// Ruta para autenticar/login de usuarios (no requiere autenticación)
router.post('/login', autenticarUsuario);

// Confirmar la cuenta del usuario con el token enviado (no requiere autenticación)
router.get('/confirmar/:token_usuario', confirmarCuenta);

// Rutas protegidas que requieren token JWT

// Obtener todos los usuarios y sus personas asociadas (Protegido por JWT)
router.get('/', checkAuth, obtenerUsuarios);

// Obtener un usuario por su cod_usuario (Protegido por JWT)
router.get('/:cod_usuario', checkAuth, obtenerUsuarioPorId);

// Actualizar un usuario por su cod_usuario (Protegido por JWT)
router.put('/:cod_usuario', checkAuth, actualizarUsuario);

// Eliminar un usuario y su persona asociada por cod_usuario (Protegido por JWT)
router.delete('/:cod_usuario', checkAuth, eliminarUsuario);

// Mostrar el perfil del usuario autenticado (Protegido por JWT)
router.get('/perfil/:cod_usuario', checkAuth, mostrarPerfil);

export default router;
