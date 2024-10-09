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
    comprobarToken,
    cambiarContrasena,
    OlvidePasssword,
} from './usuarios_controller.js';

import checkAuth from '../../middleware/Auth_middleware.js'; 

const router = express.Router();    


// Rutas protegidas que requieren token JWT para acceder
// Obtener todos los usuarios y sus personas asociadas (Protegido por JWT)
router.get('/Todos-los-usuarios', checkAuth, obtenerUsuarios);
// Obtener un usuario por su cod_usuario (Protegido por JWT)
router.get('/:cod_usuario', checkAuth, obtenerUsuarioPorId);
// Actualizar un usuario por su cod_usuario (Protegido por JWT)
router.put('/:cod_usuario', checkAuth, actualizarUsuario);
// Eliminar un usuario y su persona asociada por cod_usuario (Protegido por JWT)
router.delete('/:cod_usuario', checkAuth, eliminarUsuario);
// Mostrar el perfil del usuario autenticado (Protegido por JWT)
router.get('/perfil/:cod_usuario', checkAuth, mostrarPerfil);



// Rutas públicas
// Ruta para crear un nuevo usuario (no requiere autenticación)
router.post('/registrar', crearUsuario);
// Ruta para autenticar/login de usuarios (no requiere autenticación)
router.post('/login', autenticarUsuario);
// Confirmar la cuenta del usuario con el token enviado (no requiere autenticación)
router.get('/confirmar/:token_usuario', confirmarCuenta);
//ruta para recuperar contraseña por correo
router.post('/olvide-password', OlvidePasssword);
//ruta para el token de recuperar contraseña por correo
router.get('/olvide-password/:token', comprobarToken);
//ruta para cambiar la contraseña y almacenarla en la base de datos
router.post('/nuevopassword/:token', cambiarContrasena);

export default router;
