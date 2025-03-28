import express from 'express';
import {
        obtenerTodoTipoContacto,
        crearTipoContacto,
        actualizarTipoContacto,
        actualizarEstadoTipoContacto,
        eliminarTipoContacto
} from '../Controllers/tipoContactoController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router();

// Ruta para obtener todos los tipo contacto
router.get('/verTodoTipoContacto', obtenerTodoTipoContacto);

// Ruta para crear tipo contacto
router.post('/crearTipoContacto', crearTipoContacto);

// Ruta para actualizar tipo contacto
router.put('/actualizarTipoContacto/:cod_tipo_contacto', actualizarTipoContacto);

// Ruta para actualizar el estado de tipo contacto
router.post('/actualizarEstadoTipoContacto', actualizarEstadoTipoContacto);

// Ruta para eliminar un tipo contacto
router.delete('/eliminarTipoContacto/:cod_tipo_contacto', eliminarTipoContacto);

export default router;
