import express from 'express'; 
import { obtenerAula,
         crearAula,
         actualizarAula,
         obtenerEdificios,
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

router.put('/actualizar_aula/:Cod_aula', actualizarAula);

// Ruta para eliminar un día por el codigo
router.delete('/:Cod_aula', eliminarAula);


export default router;
