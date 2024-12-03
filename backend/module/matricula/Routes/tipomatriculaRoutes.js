import express from 'express';
import {
    crearTipoMatricula,
    actualizarTipoMatricula,
    eliminarTipoMatricula,
    consultarTipoMatricula
} from '../Controllers/tipomatriculaController.js';

const router = express.Router();

// Rutas para gestionar tipos de matrícula
router.post('/tipo-matricula', crearTipoMatricula); // Crear un nuevo tipo de matrícula
router.put('/tipo-matricula/:p_cod_tipo_matricula', actualizarTipoMatricula); // Actualizar un tipo de matrícula
router.delete('/tipo-matricula/:p_cod_tipo_matricula', eliminarTipoMatricula); // Eliminar un tipo de matrícula
router.get('/tipo-matricula/:p_cod_tipo_matricula?', consultarTipoMatricula); // Consultar un tipo de matrícula

export default router;
