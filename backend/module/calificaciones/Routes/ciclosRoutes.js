import express from 'express';
import {
    obtenerCiclos,
    crearCiclo,
    actualizarCiclo,
    eliminarCiclo
} from '../Controller/ciclosController.js'; // Importamos las funciones del controlador

const router = express.Router();

// Ruta para obtener todos los ciclos
router.get('/verCiclos', obtenerCiclos);

// Ruta para crear un nuevo ciclo
router.post('/crearCiclo', crearCiclo);

// Ruta para actualizar un ciclo
router.put('/actualizarCiclo', actualizarCiclo);

// Ruta para eliminar un ciclo
router.delete('/eliminarCiclo', eliminarCiclo);

export default router;
