import express from 'express'; 
import { obtenerSecciones,
    obtenerSeccionesPorProfesor,
    obtenerEstudiantesPorSeccion,
    obtenerNomenclaturaPorSeccion
       } from '../Controller/seccionalumnoController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router(); 

//Ruta para obtener todas las aulas
router.get('/seccionesporprofe', obtenerSeccionesPorProfesor);
router.get('/secciones', obtenerSecciones);
router.get('/estudiantes/:id', obtenerEstudiantesPorSeccion);

router.get('/nomenclatura', obtenerNomenclaturaPorSeccion);

export default router;
