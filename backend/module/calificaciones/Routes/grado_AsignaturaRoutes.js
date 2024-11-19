import express from 'express';
import {
    obtenerGradosAsignaturas,
    crearGradoAsignatura,
    actualizarGradoAsignatura,
    eliminarGradoAsignaturas
} from '../Controller/grado_AsignaturaController.js'; // Importamos las funciones del controlador

const router = express.Router();

// Ruta para obtener las asignaturas de un grado específico
router.get('/verGradosAsignaturas/:Cod_grado', obtenerGradosAsignaturas);

// Otras rutas...
router.post('/crearGradoAsignatura', crearGradoAsignatura);
router.put('/actualizarGradoAsignatura', actualizarGradoAsignatura);
router.delete('/eliminarGradoAsignaturas', eliminarGradoAsignaturas);

export default router;