import express from 'express';
import {
    crearDepartamento,
    actualizarDepartamento,
    eliminarDepartamento,
    obtenerDepartamento
} from '../Controllers/departamentocontroller.js';

const router = express.Router();

// Crear un nuevo departamento
router.post('/departamento', crearDepartamento);

// Actualizar un departamento
router.put('/departamento/:Cod_departamento', actualizarDepartamento);

// Eliminar un departamento
router.delete('/departamento/:Cod_departamento', eliminarDepartamento);

// Obtener todos los departamentos o uno específico
router.get('/departamento/:Cod_departamento?', obtenerDepartamento); // El ? hace que el parámetro sea opcional

export default router;
