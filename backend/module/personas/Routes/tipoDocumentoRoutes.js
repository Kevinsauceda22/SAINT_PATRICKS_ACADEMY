import express from 'express';
import {
    obtenerTodoTipoDocumento,
    crearTipoDocumento,
    actualizarTipoDocumento,
    eliminarTipoDocumento
} from '../Controllers/tipoDocumentosController.js'; // Asegúrate de que la ruta sea correcta

const router = express.Router();

// Ruta para obtener todos los tipos de documentos
router.get('/verTodoTipoDocumento', obtenerTodoTipoDocumento);

// Ruta para crear un nuevo tipo de documento
router.post('/crearTipoDocumento', crearTipoDocumento);

// Ruta para actualizar un tipo de documento
router.put('/actualizarTipoDocumento/:Cod_tipo_documento', actualizarTipoDocumento);

// Ruta para eliminar un tipo de documento
router.delete('/eliminarTipoDocumento/:Cod_tipo_documento', eliminarTipoDocumento);

export default router;