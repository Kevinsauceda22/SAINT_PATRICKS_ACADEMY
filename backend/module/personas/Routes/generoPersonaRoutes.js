import express from 'express';
import {
    crearGeneroPersona,
    obtenerGeneroPersona,
    actualizarGeneroPersona,
    eliminarGeneroPersona
} from '../Controllers/generoPersonaController.js';

const router = express.Router();

// Definir rutas para CRUD de géneros de persona
router.post('/crearGeneroPersona', crearGeneroPersona); // Crear género de persona
router.get('/obtenerGeneroPersona', obtenerGeneroPersona); // Obtener todos los géneros de persona
router.get('/obtenerGeneroPersona/:Cod_genero', obtenerGeneroPersona); // Obtener un género de persona por ID
router.put('/actualizarGeneroPersona/:Cod_genero', actualizarGeneroPersona); // Actualizar género de persona
router.delete('/eliminarGeneroPersona/:Cod_genero', eliminarGeneroPersona); // Eliminar género de persona

export default router;