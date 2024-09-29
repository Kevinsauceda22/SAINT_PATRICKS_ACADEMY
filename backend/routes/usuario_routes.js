import express from 'express';
import {
    crearUsuario,
    obtenerUsuarios,
    obtenerUsuarioPorId,
    actualizarUsuario,
    eliminarUsuario,
} from '../controllers/usuarios_controller.js';

const router = express.Router();

// Crear una nueva persona y usuario
router.post('/', crearUsuario);

// Obtener todos los usuarios
router.get('/', obtenerUsuarios);

// Obtener un usuario por su cod_usuario
router.get('/:cod_usuario', obtenerUsuarioPorId);

// Actualizar un usuario
router.put('/:cod_usuario', actualizarUsuario);

// Eliminar un usuario y su persona asociada
router.delete('/:cod_usuario', eliminarUsuario);


export default router;
