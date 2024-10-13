import express from 'express';
import {
    crearUsuario,
    obtenerUsuarios,
    obtenerUsuarioPorId,
    actualizarUsuario,
    eliminarUsuarioCompleto,
    confirmarCuenta,
    autenticarUsuario,
    mostrarPerfil,
    comprobarToken,
    cambiarContrasena,
    OlvidePasssword,
    agregarEstudiante
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
// Mostrar el perfil del usuario autenticado (Protegido por JWT)
router.get('/perfil/:cod_usuario', checkAuth, mostrarPerfil);
//ruta para eliminar un usuario completo
router.delete('/eliminar-perfil/:cod_usuario', checkAuth, eliminarUsuarioCompleto);
//RUTA PARA AGREGAR AL ESTUDIANTE 
router.post('/agregar-estudiante/', checkAuth, agregarEstudiante);


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

export default router;
