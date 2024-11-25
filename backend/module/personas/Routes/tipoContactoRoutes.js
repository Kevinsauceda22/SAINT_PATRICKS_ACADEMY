import express from 'express';
import {
    crearTipoContacto,
    obtenerTipoContacto,
    actualizarTipoContacto,
    eliminarTipoContacto
} from '../Controllers/tipoContactoController.js';

const router = express.Router();

// Definir rutas para CRUD de tipos de contacto
router.post('/crearTipoContacto', crearTipoContacto); // Crear tipo de contacto
router.get('/obtenerTipoContacto', obtenerTipoContacto); // Obtener todos los tipos de contacto
router.get('/obtenerTipoContacto/:cod_tipo_contacto', obtenerTipoContacto); // Obtener un tipo de contacto por ID
router.put('/actualizarTipoContacto/:cod_tipo_contacto', actualizarTipoContacto); // Actualizar tipo de contacto
router.delete('/eliminarTipoContacto/:cod_tipo_contacto', eliminarTipoContacto); // Eliminar tipo de contacto

export default router;