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
  obtenerSeccionesConDetalles,
  buscarPadrePorNombre,
  editarMatricula,      // <-- Importar editar
  eliminarMatricula,    // <-- Importar eliminar
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

// Ruta para obtener alumnos matriculados por grado
router.get('/alumnos/:cod_grado', obtenerAlumnosMatriculadosPorGradoYAno);

// Ruta para obtener datos solo por año académico del período
router.get('/matriculas-con-periodo', obtenerMatriculasConPeriodo);

// Ruta para obtener alumnos por sección
router.get('/alumnos/seccion/:cod_seccion', obtenerAlumnosPorSeccion);

// Ruta para obtener el horario por sección
router.get('/horario/:cod_seccion', obtenerHorarioPorSeccion);

// Ruta para obtener detalles de secciones por grado
router.get('/detalles/:cod_grado', obtenerSeccionesConDetalles);

// Ruta para buscar padres por nombre
router.get('/padres/buscar', buscarPadrePorNombre);

// ✅ NUEVAS RUTAS
// Ruta para editar matrícula
router.put('/matriculas/:cod_matricula', editarMatricula);

// Ruta para eliminar matrícula
router.delete('/matriculas/:cod_matricula', eliminarMatricula);

export default router;
