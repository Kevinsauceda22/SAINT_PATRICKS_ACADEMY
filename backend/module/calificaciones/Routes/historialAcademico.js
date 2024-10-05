import express from 'express';
import {
    obtenerHistoriales,
    crearHistorial,
    actualizarHistorial,
    eliminarHistorial
} from '../Controller/historialAcademicoController.js'; // Importamos las funciones del controlador

const router = express.Router();

// Ruta para obtener todos los historiales académicos
router.get('/historiales', obtenerHistoriales);

// Ruta para crear un nuevo historial académico
router.post('/crearhistorial', crearHistorial);

// Ruta para actualizar un historial académico
router.put('/actualizarhistorial', actualizarHistorial);

// Ruta para eliminar un historial académico
router.delete('/eliminarhistorial', eliminarHistorial);

export default router;
