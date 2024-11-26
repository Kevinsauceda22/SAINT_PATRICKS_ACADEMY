import express from 'express';
import {
    crearPeriodoMatricula,
    obtenerPeriodoMatricula,
    actualizarPeriodoMatricula,
    eliminarPeriodoMatricula,
    actualizarEstadoPeriodo,
} from '../Controllers/periodomatriculaController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router();

// Ruta para crear un periodo de matrícula
router.post('/crearperiodomatricula', crearPeriodoMatricula);

// Ruta para obtener todos los periodos de matrícula
router.get('/periodos', obtenerPeriodoMatricula);

// Ruta para obtener un periodo de matrícula por Cod_periodo_matricula
router.get('/periodos/:Cod_periodo_matricula', obtenerPeriodoMatricula);

// Ruta para actualizar un periodo de matrícula por Cod_periodo_matricula
router.put('/periodos/:Cod_periodo_matricula', actualizarPeriodoMatricula);

// Ruta para eliminar un periodo de matrícula por Cod_periodo_matricula
router.delete('/periodos/:Cod_periodo_matricula', eliminarPeriodoMatricula);

// **Nueva Ruta** para actualizar el estado de un periodo de matrícula
router.put('/estado', actualizarEstadoPeriodo); // Correctamente registrada en el router

export default router;
