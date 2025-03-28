import express from 'express';
import {
        obtenerTodoTipoDocumentos,
        crearTipoDocumentos,
        actualizarTipoDocumentos,
        actualizarEstadoTipoDocumentos,
        eliminarTipoDocumentos
} from '../Controllers/tipoDocumentosController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router();

// Ruta para obtener todos los tipos de documentos
router.get('/verTodoTipoDocumentos', obtenerTodoTipoDocumentos);

// Ruta para crear un tipo de documento
router.post('/crearTipoDocumentos', crearTipoDocumentos);

// Ruta para actualizar un tipo de documento
router.put('/actualizarTipoDocumentos/:cod_tipo_documento', actualizarTipoDocumentos);

// Ruta para actualizar el estado de un tipo de documento
router.post('/actualizarEstadoTipoDocumentos', actualizarEstadoTipoDocumentos);

// Ruta para eliminar un tipo de documento
router.delete('/eliminarTipoDocumentos/:cod_tipo_documento', eliminarTipoDocumentos);

export default router;
