import express from 'express';

import {
    obtenerHistoriales,
    crearHistorial,
    actualizarHistorial,
    eliminarHistorial,
    obtenerGradosMatricula,
    obtenerPersonasPorGrado,
    obtenerHistorialPorPersona,
    getAllEstadoNota
} from '../Controller/historialAcademicoController.js'; // Importamos las funciones del controlador

const router = express.Router();

// Ruta para obtener todos los historiales académicos
router.get('/historiales', obtenerHistoriales);
router.get('/gradosMatricula', obtenerGradosMatricula);
router.get('/gradosMatricula/:cod_grado/:anio_academico', obtenerPersonasPorGrado);
router.get('/gradosMatricula/:Cod_persona', obtenerHistorialPorPersona);
router.get('/estado', getAllEstadoNota);



// Ruta para crear un nuevo historial académico
router.post('/crearhistorial', crearHistorial);

// Ruta para actualizar un historial académico
router.put('/actualizarhistorial', actualizarHistorial);

// Ruta para eliminar un historial académico
router.delete('/eliminarhistorial', eliminarHistorial);



export default router;
