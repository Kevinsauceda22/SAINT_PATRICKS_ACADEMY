import express from 'express';
import { obtenerActividadesExtra,
         crearActividadesExtra,
         actualizarActividadesExtra,
         eliminarActividadExtracurricular } from '../Controllers/actividades_extracurricularesController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router();

// Ruta para obtener todas las actividades extracurriculares o una específica
router.get('/actividades/extracurriculares/:Cod_actividades_extracurriculares?', obtenerActividadesExtra);

// Ruta para crear una nueva actividad extracurricular
router.post('/actividades/extracurriculares', crearActividadesExtra);

// Ruta para actualizar una actividad extracurricular
router.put('/actividades/extracurriculares', actualizarActividadesExtra);

// Ruta para eliminar una actividad extracurricular
router.delete('/actividades/extracurriculares/:Cod_actividad', eliminarActividadExtracurricular);

export default router;
