import express from 'express';
import {
    crearUsuario,
    obtenerUsuarios,
    cambiarEstadoUsuario,
    obtenerUsuarioPorId,
    eliminarUsuarioCompleto,
    confirmarCuenta,
    autenticarUsuario,
    mostrarPerfil,
    comprobarToken,
    cambiarContrasena,
    OlvidePasssword,
    agregarEstudiante,
    preRegistroUsuario,
    enableTwoFactorAuth,
    verifyTwoFactorAuthCode,
    disableTwoFactorAuth,
    getTwoFactorStatus,
    updateTwoFactorAuthStatus,
    actualizarOtp,
    mostrarRolYCorreo,
    getPermisos
} from './usuarios_controller.js';

import checkAuth from '../../middleware/Auth_middleware.js'; 

const router = express.Router();    


// Rutas protegidas que requieren token JWT para acceder
// Obtener todos los usuarios y sus personas asociadas (Protegido por JWT)
router.get('/Todos-los-usuarios', checkAuth, obtenerUsuarios);
// Obtener un usuario por su cod_usuario (Protegido por JWT)
router.get('user/:cod_usuario', checkAuth, obtenerUsuarioPorId);
// Mostrar el perfil del usuario autenticado (Protegido por JWT)
router.get('/perfil/:cod_usuario', checkAuth, mostrarPerfil);
//ruta para eliminar un usuario completo
router.delete('/eliminar-perfil/:cod_usuario', checkAuth, eliminarUsuarioCompleto);
//RUTA PARA AGREGAR AL ESTUDIANTE 
router.post('/agregar-estudiante/', checkAuth, agregarEstudiante);
router.put('/cambiar-estado', checkAuth, cambiarEstadoUsuario);
// Ruta para habilitar 2FA
router.post('/enableTwoFactorAuth/:cod_usuario', checkAuth,enableTwoFactorAuth);
// Ruta para habilitar 2FA
router.post('/disableTwoFactorAuth', checkAuth,disableTwoFactorAuth);
// Ruta para verificar el código TOTP
router.post('/verifyTwoFactorAuthCode',checkAuth, verifyTwoFactorAuthCode);
 // Add to routes
 router.get('/2faStatus/:cod_usuario', checkAuth, getTwoFactorStatus);
// Ruta para actualizar el estado de 2FA
router.post('/update-2fa-status',checkAuth, updateTwoFactorAuthStatus);
// Ruta para actualizar otp_verified
router.put('/actualizarOtp/:cod_usuario', checkAuth, actualizarOtp);
// Nueva ruta para obtener solo el rol y el correo del usuario
router.get('/rol-correo/:cod_usuario', checkAuth, mostrarRolYCorreo);
//obtenerPermisosPorRolYObjeto
router.get('/permisos', getPermisos);




// Rutas públicas
// Ruta para crear un nuevo usuario (no requiere autenticación)====999
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
//ruta para pre-registrar al padre de familia
router.post('/pre-registrar-padre', preRegistroUsuario);


export default router;
