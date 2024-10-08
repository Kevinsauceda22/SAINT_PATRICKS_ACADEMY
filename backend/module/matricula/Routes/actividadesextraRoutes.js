import express from 'express';
import {
        obtenerActExtra,
        crearActividadExtracurricular,
        actualizarActividadExtracurricular,
        eliminarActividadExtracurricular
} from '../Controllers/actividades_extracurricularesController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router();

// Ruta para obtener todas las actividades extracurriculares
router.get('/extracurriculares', obtenerActExtra);

//Ruta para obtener una actividad por nombre de actividad o nombre de sección
router.get('/extracurriculares/:Nombre_actividad?/:nombreSeccion?', obtenerActExtra);

// Ruta para crear una actividad extracurricular
router.post('/crearactividad', crearActividadExtracurricular);

// Ruta para actualizar una actividad
router.put('/actualizaractividades', actualizarActividadExtracurricular); // Actualiza la actidad

// Ruta para eliminar una actividad por Cod_actividad
router.delete('/actividades/:p_cod_actividad', eliminarActividadExtracurricular); // Nueva ruta para eliminar actividad


export default router;