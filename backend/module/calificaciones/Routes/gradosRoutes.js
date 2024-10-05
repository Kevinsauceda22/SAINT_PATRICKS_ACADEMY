import express from 'express';
import {
    obtenerGrados,
    crearGrado,
    actualizarGrado,
    eliminarGrado
} from '../Controller/gradosController.js'; // Importamos las funciones del controlador

const router = express.Router();

// Ruta para obtener todos los grados
router.get('/verGrados', obtenerGrados);

// Ruta para crear un nuevo grado
router.post('/crearGrado', crearGrado);

// Ruta para actualizar un grado
router.put('/actualizarGrado', actualizarGrado);

// Ruta para eliminar un grado
router.delete('/eliminarGrado', eliminarGrado);

export default router;
