import express from 'express';
import {
    obtenerParciales,
    crearParcial,
    actualizarParcial,
    eliminarParcial
} from '../Controller/parcialesController.js'; // Importamos las funciones del controlador

const router = express.Router();

// Ruta para obtener todos los parciales
router.get('/verParciales', obtenerParciales);

// Ruta para crear un nuevo parcial
router.post('/crearParcial', crearParcial);

// Ruta para actualizar un parcial
router.put('/actualizarParcial', actualizarParcial);

// Ruta para eliminar un parcial
router.delete('/eliminar_parcial', eliminarParcial);

export default router;
