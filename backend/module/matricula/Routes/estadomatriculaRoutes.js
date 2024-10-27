import express from 'express';
import {
    crearEstadoMatricula,
    actualizarEstado,
    eliminarEstadoMatricula,
    obtenerEstadoMatricula
} from '../Controllers/estadomatriculaController.js';

const router = express.Router();

// Crear un estado de matrícula
router.post('/estado-matricula', crearEstadoMatricula);

// Actualizar un estado de matrícula
router.put('/estado-matricula/:p_cod_estado_matricula', actualizarEstado);

// Eliminar un estado de matrícula
router.delete('/estado-matricula/:p_cod_estado_matricula', eliminarEstadoMatricula);

// Ruta para obtener todos los estados de matrícula o un estado específico
router.get('/estado-matricula/:cod_estado_matricula?', obtenerEstadoMatricula); // El ? hace que el parámetro sea opcional

export default router;
