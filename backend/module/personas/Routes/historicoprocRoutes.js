import express from 'express';  
import { 
    obtenerHistoricoProcedencia,
    crearHistoricoProcedencia,
    actualizarHistoricoProcedencia,
    eliminarHistoricoProcedencia 
} from '../Controllers/historico_procedenciaController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router();

// Ruta para obtener todos los registros de historico procedencia
router.get('/ver_historico_procedencia', obtenerHistoricoProcedencia);

// Ruta para crear un nuevo registro de historico procedencia
router.post('/crear_historico', crearHistoricoProcedencia);

// Ruta para actualizar un registro de historico procedencia
router.put('/actualizar_historico/:cod_procedencia', actualizarHistoricoProcedencia);

// Ruta para eliminar un registro de historico procedencia por código
router.delete('/eliminar_historico/:cod_procedencia', eliminarHistoricoProcedencia);

export default router;
