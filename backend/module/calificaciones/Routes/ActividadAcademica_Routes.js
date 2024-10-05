import express from 'express';
import {
    obtenerActividadesAcademicas,
    crearActividadAcademica,
    actualizarActividadAcademica
} from '../Controller/activiades_AcademicasController.js'; // Importamos las funciones del controlador

const router = express.Router();

// Ruta para obtener todas las actividades académicas
router.get('/veractividades', obtenerActividadesAcademicas);

// Ruta para crear una nueva actividad académica
router.post('/crearactividadacademica', crearActividadAcademica);

// Ruta para actualizar una actividad académica
router.put('/actualizaractividad', actualizarActividadAcademica);

export default router;
