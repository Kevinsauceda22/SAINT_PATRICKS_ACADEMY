import express from 'express';
import { obtenerSecciones,obtenerActividadesExtra,
         crearActividadesExtra,
         actualizarActividadesExtra,
         cambiarEstadoActividad,
         eliminarActividadExtracurricular } from '../Controllers/actividades_extracurricularesController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router();
// Ruta para obtener todas las secciones 
router.get('/obtener_secciones/:Cod_secciones?', obtenerSecciones);
// Ruta para obtener todas las actividades extracurriculares o una específica
router.get('/actividades/extracurriculares/:Cod_actividades_extracurriculares?', obtenerActividadesExtra);

// Ruta para crear una nueva actividad extracurricular
router.post('/actividades/extracurriculares', crearActividadesExtra);

// Ruta para actualizar una actividad extracurricular
router.put('/actividades/extracurriculares', actualizarActividadesExtra);
// Ruta para cambiar el estado de una actividad extracurricular
router.put('/actividades/cambiar_estado', cambiarEstadoActividad);

// Ruta para eliminar una actividad extracurricular
router.delete('/actividades/extracurriculares/:Cod_actividad', eliminarActividadExtracurricular);

router.get('/padres-y-grados', obtenerPadresYGradosSecciones);

// Ruta para enviar notificaciones a los padres de una sección
router.post('/notificar-actividad/:cod_seccion', notificarNuevaActividad);

// Ruta para enviar notificaciones de cancelación a los padres de una sección
router.post('/cancelar-actividad/:cod_seccion', notificarCancelacionActividad);

// Ruta para notificar cambios en actividades a los padres de una sección
router.post('/actualizar-actividad/:cod_seccion', notificarCambioActividad);

export default router;
