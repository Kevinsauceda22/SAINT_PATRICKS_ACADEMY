import express from 'express';
import checkAuth from '../../../middleware/Auth_middleware.js'; // Importa el middleware de verificación de token
import {
    obtenerSolicitudes,
    insertarSolicitud,
    actualizarSolicitud,
    obtenerSolicitudPorCod,
    eliminarSolicitud,
    
} from '../Controllers/solicitudController.js';

const router = express.Router();

// Rutas protegidas
router.get('/solicitudes', checkAuth, obtenerSolicitudes); // Obtener todas las solicitudes
router.get('/solicitudes/:Cod_solicitud', checkAuth, obtenerSolicitudPorCod); // Obtener una solicitud específica
router.post('/solicitudes', checkAuth, insertarSolicitud); // Insertar una nueva solicitud
router.put('/solicitudes/:Cod_solicitud', checkAuth, actualizarSolicitud); // Actualizar una solicitud
router.delete('/solicitudes/:Cod_solicitud', checkAuth, eliminarSolicitud); // Eliminar una solicitud

export default router;
