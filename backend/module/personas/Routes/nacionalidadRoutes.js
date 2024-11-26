import express from 'express';
import {
    obtenerTodasNacionalidades,
    crearNacionalidad,
    actualizarNacionalidad,
    eliminarNacionalidad
} from '../Controllers/nacionalidadController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router();

// Ruta para obtener todas los tipo relacion
router.get('/verNacionalidades', obtenerTodasNacionalidades);

//Ruta para crear tipo relacion
router.post('/crearNacionalidades',crearNacionalidad)

// Ruta para actualizar tipo relacion
router.put('/actualizarNacionalidades/:Cod_nacionalidad', actualizarNacionalidad);

// Ruta para eliminar una actividad por Cod_actividad
router.delete('/eliminarNacionalidades/:Cod_nacionalidad', eliminarNacionalidad); // Nueva ruta para eliminar actividad

export default router;