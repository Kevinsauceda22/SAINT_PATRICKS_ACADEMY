import express from 'express';
import {
    crearEstadoMatricula,
    actualizarEstado,
    eliminarEstadoMatricula,
    obtenerEstadoMatricula,
    cambiarEstadoEstadoMatricula, // 👈 Agregado para activar/inactivar
} from '../Controllers/estadomatriculaController.js';

const router = express.Router();

// Crear un estado de matrícula
router.post('/estado-matricula', crearEstadoMatricula);

// Actualizar un estado de matrícula
router.put('/estado-matricula/:p_cod_estado_matricula', actualizarEstado);

// Eliminar un estado de matrícula
router.delete('/estado-matricula/:p_cod_estado_matricula', eliminarEstadoMatricula);

// Obtener todos los estados de matrícula o uno específico
router.get('/estado-matricula/:cod_estado_matricula?', obtenerEstadoMatricula);

// 👉 Nueva ruta para cambiar el estado (activo/inactivo)
router.put('/estado-matricula/estado/:p_cod_estado_matricula', cambiarEstadoEstadoMatricula);

export default router;
