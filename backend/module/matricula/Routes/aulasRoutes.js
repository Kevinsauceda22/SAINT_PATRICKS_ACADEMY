import express from 'express'; 
import { obtenerAula,
         crearAula,
         actualizarAula,
         eliminarAula
       } from '../Controllers/aulasController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router(); 

//Ruta para obtener todas las aulas
router.get('/aulas', obtenerAula);

//Ruta para obtener una aula
router.get('/aulas/:Numero_aula', obtenerAula);

//ruta para crear una aula
router.post('/crear_aula', crearAula);

//ruta para actualizar una aula
router.put('/actualizar_aula', actualizarAula);

//ruta para eliminar una aula
router.delete('/:p_Numero_aula', eliminarAula);

export default router;
