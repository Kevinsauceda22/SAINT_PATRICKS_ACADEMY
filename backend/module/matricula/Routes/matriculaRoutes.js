import express from 'express';
import { crearMatricula, obtenerMatriculas, obtenerOpcionesMatricula, obtenerHijosPorDniPadre, obtenerSeccionesPorGrado } from '../Controllers/matriculaController.js';

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

export default router;
