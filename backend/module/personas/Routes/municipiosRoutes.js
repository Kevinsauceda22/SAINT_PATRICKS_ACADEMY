import express from 'express';
import {
        obtenerTodoMunicipio,
        crearMunicipio,
        actualizarMunicipio,
        actualizarEstadoMunicipio,
        eliminarMunicipio
} from '../Controllers/municipioController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router();

// Ruta para obtener todos los municipios
router.get('/verTodoMunicipio', obtenerTodoMunicipio);

// Ruta para crear un municipio
router.post('/crearMunicipio', crearMunicipio);

// Ruta para actualizar un municipio
router.put('/actualizarMunicipio/:Cod_municipio', actualizarMunicipio);

// Ruta para actualizar el estado de un municipio
router.post('/actualizarEstadoMunicipio', actualizarEstadoMunicipio);

// Ruta para eliminar un municipio
router.delete('/eliminarMunicipio/:Cod_municipio', eliminarMunicipio);

export default router;
