import express from 'express';
import {
    obtenerActividadesAcademicas,
    crearActividadAcademica,
    actualizarActividadAcademica,
    getActividadesPorProfesor,
    eliminarActividadAcademica
} from '../Controller/activiades_AcademicasController.js'; // Importamos las funciones del controlador

const router = express.Router();

// Ruta para obtener todas las actividades académicas
router.get('/veractividades', obtenerActividadesAcademicas);

// Ruta para crear una nueva actividad académica
router.post('/crearactividadacademica', crearActividadAcademica);

// Ruta para actualizar una actividad académica
router.put('/actualizaractividad', actualizarActividadAcademica);

// Ruta para obtener las actividades por Cod_profesor
router.get('/veractividadesProfesor/:Cod_profesor', getActividadesPorProfesor);

router.delete('/eliminarActividad', eliminarActividadAcademica);

export default router;
