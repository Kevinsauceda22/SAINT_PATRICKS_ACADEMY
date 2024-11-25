import express from 'express';
import {
    crearContacto,
    obtenerContacto,
    actualizarContacto,
    eliminarContacto,
} from '../Controllers/contactoController.js';

const router = express.Router();

// Definir rutas para CRUD de contactos
router.post('/crearContacto', crearContacto); // Crear contacto
router.get('/obtenerContacto/personas/:cod_persona', obtenerContacto); // Obtener contactos por persona (más específico)
router.get('/obtenerContacto/:cod_contacto', obtenerContacto); // Obtener un contacto por ID (general)
router.get('/obtenerContacto', obtenerContacto); // Obtener todos los contactos (sin parámetros)
router.put('/actualizarContacto/:cod_contacto', actualizarContacto); // Actualizar contacto
router.delete('/eliminarContacto/:cod_contacto', eliminarContacto); // Eliminar contacto

export default router;
