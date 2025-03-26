import express from 'express';
import {
    obtenerTodoDepartamento,
    crearDepartamento,
    actualizarDepartamento,
    actualizarEstadoDepartamento,
    eliminarDepartamento
} from '../Controllers/departamentosController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router();

// Ruta para obtener todos los departamentos
router.get('/verTodoDepartamento', obtenerTodoDepartamento);

// Ruta para crear un departamento
router.post('/crearDepartamento', crearDepartamento);

// Ruta para actualizar un departamento
router.put('/actualizarDepartamento/:Cod_departamento', actualizarDepartamento);

// Ruta para actualizar el estado de un departamento
router.post('/actualizarEstadoDepartamento', actualizarEstadoDepartamento);

// Ruta para eliminar un departamento por Cod_departamento
router.delete('/eliminarDepartamento/:Cod_departamento', eliminarDepartamento);

export default router;
