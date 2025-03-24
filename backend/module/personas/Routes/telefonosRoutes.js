import express from 'express';
import {
    obtenerTodosTelefonos,
    crearTelefono,
    actualizarTelefono,
    eliminarTelefono
} from '../Controllers/telefonosController.js';

const router = express.Router();

// Ruta para obtener todos los teléfonos
router.get('/verTodosTelefonos', obtenerTodosTelefonos);

// Ruta para crear un teléfono
router.post('/crearTelefono', crearTelefono);

// Ruta para actualizar un teléfono
router.put('/actualizarTelefono/:Cod_telefono', actualizarTelefono);

// Ruta para eliminar un teléfono
router.delete('/eliminarTelefono/:Cod_telefono', eliminarTelefono);

export default router;
