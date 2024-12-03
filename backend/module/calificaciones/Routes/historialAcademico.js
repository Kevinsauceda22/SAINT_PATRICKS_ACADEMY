import express from 'express';
import {
    obtenerHistoriales,
    crearHistorial,
    actualizarHistorial,
    eliminarHistorial,
    obtenerGradosMatricula,
    obtenerPersonasPorGrado 
} from '../Controller/historialAcademicoController.js'; // Importamos las funciones del controlador

const router = express.Router();

// Ruta para obtener todos los historiales acadÃ©micos
router.get('/historiales', obtenerHistoriales);
router.get('/gradosMatricula', obtenerGradosMatricula);
router.get('/gradosMatricula/:cod_grado', obtenerPersonasPorGrado);



// Ruta para crear un nuevo historial acadÃ©mico
router.post('/crearhistorial', crearHistorial);

// Ruta para actualizar un historial acadÃ©mico
router.put('/actualizarhistorial', actualizarHistorial);

// Ruta para eliminar un historial acadÃ©mico
router.delete('/eliminarhistorial', eliminarHistorial);



export default router;
