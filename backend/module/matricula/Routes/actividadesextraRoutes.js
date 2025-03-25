import express from 'express';
import { obtenerSecciones,obtenerActividadesExtra,
         crearActividadesExtra,
         actualizarActividadesExtra,
         cambiarEstadoActividad,
         obtenerPadresYGradosSecciones,
         obtenerSeccionesPeriodoActivo} 
       from '../Controllers/actividades_extracurricularesController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router();

// Ruta para obtener 
router.get('/obtener_secciones/:Cod_secciones?', obtenerSecciones);

// Ruta para obtener todas las actividades extracurriculares o una específica
router.get('/actividades/extracurriculares/:Cod_actividades_extracurriculares?', obtenerActividadesExtra);

// Ruta para crear una nueva actividad extracurricular
router.post('/actividades/extracurriculares', crearActividadesExtra);

// Ruta para actualizar una actividad extracurricular
router.put('/actividades/extracurriculares', actualizarActividadesExtra);

// Ruta para cambiar el estado de una actividad extracurricular
router.put('/actividades/cambiar_estado', cambiarEstadoActividad);

router.get('/padres-y-grados', obtenerPadresYGradosSecciones);

router.get('/secciones/periodo-activo', obtenerSeccionesPeriodoActivo);

export default router;