import express from 'express';
import {
        obtenerTodosContactos,
        crearContacto,
        actualizarContacto,
        actualizarEstadoContacto,
        eliminarContacto
} from '../Controllers/contactoController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router();

// Ruta para obtener todos los contactos
router.get('/verTodosContactos', obtenerTodosContactos);        

// Ruta para crear un contacto
router.post('/crearContacto', crearContacto);

// Ruta para actualizar un contacto
router.put('/actualizarContacto/:cod_contacto', actualizarContacto);

// Ruta para actualizar el estado de un contacto
router.post('/actualizarEstadoContacto', actualizarEstadoContacto);

// Ruta para eliminar un contacto
router.delete('/eliminarContacto/:cod_contacto', eliminarContacto);

export default router;  
