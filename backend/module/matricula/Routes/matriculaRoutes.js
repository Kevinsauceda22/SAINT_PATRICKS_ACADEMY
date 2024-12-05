import express from 'express';
import {
  crearMatricula,
  obtenerMatriculas,
  obtenerOpcionesMatricula,
  obtenerHijosPorDniPadre,
  obtenerSeccionesPorGrado,
  obtenerAlumnosMatriculadosPorGradoYAno,
  obtenerMatriculasConPeriodo, 
  obtenerAlumnosPorSeccion,
  obtenerHorarioPorSeccion,
  obtenerSeccionesConDetalles,// Importar el nuevo controlador
} from '../Controllers/matriculaController.js';

const router = express.Router();

// Ruta para crear una matrícula
router.post('/crearmatricula', crearMatricula);

// Ruta para obtener todas las matrículas o una matrícula específica
router.get('/matriculas/:Cod_matricula?', obtenerMatriculas);

// Ruta para obtener opciones de matrícula
router.get('/opciones', obtenerOpcionesMatricula);

// Ruta para obtener los hijos asociados al DNI del padre
router.get('/hijos/:dni_padre', obtenerHijosPorDniPadre);

// Ruta para obtener secciones disponibles para un grado específico
router.get('/secciones/:cod_grado', obtenerSeccionesPorGrado);

// Nueva ruta para obtener alumnos matriculados por grado
router.get('/alumnos/:cod_grado', obtenerAlumnosMatriculadosPorGradoYAno);
// Ruta para obtener datos solo por año académico del período
router.get('/matriculas-con-periodo', obtenerMatriculasConPeriodo);
router.get('/alumnos/seccion/:cod_seccion', obtenerAlumnosPorSeccion);

// Ruta para obtener el horario por sección
router.get('/horario/:cod_seccion', obtenerHorarioPorSeccion);

router.get('/detalles/:cod_grado', obtenerSeccionesConDetalles);




export default router;
