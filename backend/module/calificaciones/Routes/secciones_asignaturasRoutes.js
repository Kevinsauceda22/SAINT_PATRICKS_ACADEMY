import express from 'express';
import {obtenerAsignaturasPorSeccion,
    obtenerSeccionesPorProfesor,
    obtenerTodasLasSeccionesYProfesoresAdmin
} from '../Controller/secciones_asignaturas.js';

const router = express.Router();


// Definir la ruta para obtener asignaturas por sección
router.get('/porseccion/:codSeccion', obtenerAsignaturasPorSeccion);
// Ruta para obtener las secciones de un profesor usando el token
router.get('/porprofesor', obtenerSeccionesPorProfesor);

// Define la ruta para obtener las secciones por profesor
router.get('/porprofesor/:codProfesor', obtenerTodasLasSeccionesYProfesoresAdmin);


export default router;