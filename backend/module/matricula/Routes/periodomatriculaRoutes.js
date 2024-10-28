import express from 'express';
import {
    crearPeriodoMatricula,
    obtenerPeriodoMatricula,
    actualizarPeriodoMatricula,
    eliminarPeriodoMatricula
} from '../Controllers/periodomatriculaController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router();

// Ruta para crear un periodo de matrícula
router.post('/crearperiodomatricula', crearPeriodoMatricula);

// Ruta para obtener todos los periodos de matrícula
router.get('/periodos', obtenerPeriodoMatricula);

// Ruta para obtener un periodo de matrícula por Cod_periodo_matricula
router.get('/periodos/:Cod_periodo_matricula', obtenerPeriodoMatricula);

// Ruta para actualizar un periodo de matrícula por Cod_periodo_matricula
router.put('/periodos/:Cod_periodo_matricula', actualizarPeriodoMatricula); // Es necesario enviar Cod_periodo_matricula en la URL

// Ruta para eliminar un periodo de matrícula por Cod_periodo_matricula
router.delete('/periodos/:Cod_periodo_matricula', eliminarPeriodoMatricula); // Nueva ruta para eliminar periodo

export default router;
