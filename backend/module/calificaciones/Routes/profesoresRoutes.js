import express from 'express';
import {
    obtenerProfesores,
    crearProfesor,
    actualizarProfesor,
    eliminarProfesor,
    obtenerCodProfesorPorToken, 
    actualizarEstadoProfesor
} from '../Controller/profesoresController.js'; // Importa el controlador
import checkAuth from '../../../middleware/Auth_middleware.js'; // Importa el middleware de verificación de token

const router = express.Router();

// Ruta para obtener todos los profesores
router.get('/verprofesores', obtenerProfesores);

// Ruta para crear un nuevo profesor
router.post('/crearprofesor', crearProfesor);

// Ruta para actualizar el estado de un profesor
router.post('/actualizarEstadoProfesor', actualizarEstadoProfesor);

// Ruta para actualizar un profesor
router.put('/actualizarprofesor', actualizarProfesor);

// Ruta para eliminar un profesor
router.delete('/eliminarprofesor', eliminarProfesor);

// Ruta para obtener el código del profesor basado en el token
router.get('/obtenerCodProfesor', obtenerCodProfesorPorToken);


export default router;
