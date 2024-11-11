import express from 'express'; 
import { obtenerSecciones,
    obtenerEstudiantesPorSeccion
       } from '../Controller/seccionalumnoController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router(); 

//Ruta para obtener todas las aulas
router.get('/secciones', obtenerSecciones);
router.get('/estudiantes/:id', obtenerEstudiantesPorSeccion);

export default router;
