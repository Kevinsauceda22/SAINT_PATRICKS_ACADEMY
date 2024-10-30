import express from 'express';
import {
    agregarRegistro,
    editarRegistro,
    eliminarRegistro,
    obtenerRegistros
} from './librodiario_Controller.js';

import checkAuth from '../../middleware/Auth_middleware.js'; 

const router = express.Router();

// Ruta para agregar un nuevo registro al libro diario
router.post('/',checkAuth, agregarRegistro);

// Ruta para editar un registro existente del libro diario
router.put('/:cod_libro_diario',checkAuth, editarRegistro);

// Ruta para eliminar un registro del libro diario
router.delete('/:cod_libro_diario',checkAuth, eliminarRegistro);

// Ruta para obtener todos los registros del libro diario
router.get('/', checkAuth,obtenerRegistros);

export default router;
