// Archivo: seccionesRoutes.js
import express from 'express';
import { obtenerSeccionPorId, 
         obtenerSeccionesPorPeriodo,
         obtenerPeriodoActivo,
         obtenerEdificios, 
         obtenerEdificioPorId, 
         obtenerAulasPorEdificio, 
         obtenerAulas, 
         obtenerGrados,
         obtenerSeccionesPorGrado,  
         obtenerProfesores, 
         obtenerPeriodos, 
         generarNombreSeccion, 
         crearSeccion, 
         actualizarSeccion, 
         eliminarSeccion 
} from '../Controllers/seccionesController.js';

const router = express.Router();

// Ruta para obtener una sección específica
router.get('/obtener_seccion/:Cod_secciones', obtenerSeccionPorId);

// Ruta para obtener todas las secciones por el cod_periodo_matricula
router.get('/obtener_seccperiodo/:Cod_periodo_matricula?', obtenerSeccionesPorPeriodo);

// Ruta para obtener el período académico activo
router.get('/periodo_academico/activo', obtenerPeriodoActivo);

// Ruta para obtener todos los edificios
router.get('/edificios', obtenerEdificios);

// Ruta para obtener un edificio específico por Cod_edificio
router.get('/edificios/:Cod_edificio', obtenerEdificioPorId); 

// Ruta para obtener aulas filtradas por edificio
router.get('/aulas/por_edificio/:Cod_edificio', obtenerAulasPorEdificio);

// Ruta para obtener grados
router.get('/aulas', obtenerAulas);

// Ruta para obtener grados
router.get('/grados', obtenerGrados);

// Ruta para obtener las secciones por grado y período académico
router.get('/obtener_secciones_por_grado/:Cod_grado/:Cod_periodo_matricula', obtenerSeccionesPorGrado);

// Ruta para obtener profesores
router.get('/profesores', obtenerProfesores);

// Ruta para obtener el periodo de matrícula activo
router.get('/periodo_academico', obtenerPeriodos);

// Ruta para generar nombres de secciones automáticamente
router.get('/generar_nombre_seccion/:codGrado/:anioAcademico', generarNombreSeccion);

// Ruta para crear una nueva sección
router.post('/crear_seccion', crearSeccion);

// Ruta para actualizar una sección
router.put('/actualizar_seccion', actualizarSeccion);

// Ruta para eliminar una sección
router.delete('/eliminar_seccion/:Cod_seccion', eliminarSeccion);

export default router;
