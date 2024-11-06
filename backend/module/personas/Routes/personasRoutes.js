import express from 'express';
import {
        obtenerPersonas,
        obtenerDetallePersona,
        crearPersona,
        actualizarPersona,
        eliminarPersona,
        obtenerDetallePersona

} from '../Controllers/personasController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router();

// Ruta para obtener todas las estructuras familiares
router.get('/verPersonas', obtenerPersonas);

// Ruta para ver detalle de la persona
router.get('/verPersonaDetalle/:cod_persona', obtenerDetallePersona);

//Ruta para obtener las personas
router.post('/crearPersona', crearPersona);

//Ruta para obtener las personas por rol 
router.put('/actualizarPersona/:cod_persona', actualizarPersona);

//Ruta paar obtener las tipo de relaciones 
router.delete('/eliminarPersona/:cod_persona', eliminarPersona);

export default router;