import express from 'express';
import {
    obtenerHistorialesPorPersona,
    crearHistorial,
    actualizarHistorial,
    eliminarHistorial
} from '../Controller/historialAcademicoController.js'; // Importamos las funciones del controlador

const router = express.Router();

// Ruta para obtener historiales acadÃ©micos por Cod_persona
router.get('/historiales/persona/:Cod_persona', obtenerHistorialesPorPersona);



// Ruta para crear un nuevo historial acadÃ©mico
router.post('/crearhistorial', crearHistorial);

// Ruta para actualizar un historial acadÃ©mico
router.put('/actualizarhistorial', actualizarHistorial);

// Ruta para eliminar un historial acadÃ©mico
router.delete('/eliminarhistorial', eliminarHistorial);

export default router;
