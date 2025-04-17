import express from 'express'; 
import { obtenerAula,
         crearAula,
         actualizarAula,
         obtenerEdificios,
         actualizarEstadoAula,
         eliminarAula,
       } from '../Controllers/aulasController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router(); 

//Ruta para obtener todas las aulas
router.get('/aulas', obtenerAula);
//Ruta para obtener una aula
router.get('/aulas/:Cod_aula', obtenerAula);
//ruta para crear una aula
router.post('/crear_aula', crearAula);
//Ruta para obtener todas las aulas
router.get('/edificio', obtenerEdificios);
//Ruta para actualizar las aulas
router.put('/actualizar_aula/:Cod_aula', actualizarAula);
// Ruta para actualizar el estado del aula
router.put('/actualizar_estado_aula', actualizarEstadoAula);
//router.put('/actualizar_estado', actualizarEstadoAula);

// Ruta para eliminar un día por el codigo
router.delete('/:Cod_aula', eliminarAula);


export default router;
