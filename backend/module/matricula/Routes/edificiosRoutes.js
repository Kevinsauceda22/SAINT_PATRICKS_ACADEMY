import express from 'express'; 
import { obtenerEdificios,
         crearEdificio,
         actualizarEdificio,
         actualizarEstadoEdificio,
         eliminarEdificio} from '../Controllers/edificiosController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router(); 

// Ruta para obtener todos los edificios
router.get('/edificios', obtenerEdificios);

//Ruta para obtener un edificio
router.get('/edificios/:Cod_edificio', obtenerEdificios);

//Ruta para crear un edificio
router.post('/crear_edificio', crearEdificio);

//Ruta para actualizar un edificio
router.put('/actualizar_edificio', actualizarEdificio);

//Ruta para actualizar el estado de un edificio
router.put("/actualizar_estado", actualizarEstadoEdificio);

//Ruta para eliminar un edificio
router.delete('/:Cod_edificio', eliminarEdificio);
export default router;

