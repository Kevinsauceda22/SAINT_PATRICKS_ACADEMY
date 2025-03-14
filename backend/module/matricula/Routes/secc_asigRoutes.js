import express from 'express';
import {obtenerTodasSeccionesAsignaturas, 
        obtenerTodasAsignaturas,
        obtenerTodasSecciones,
        obtenerTodosGrados,
        crearSeccionAsignatura, 
        actualizarSeccionAsignatura, 
        eliminarSeccionAsignatura,
} from '../Controllers/secc_asigController.js';

const router = express.Router();


// Ruta para obtener secciones
router.get('/verSeccionesAsignaturas', obtenerTodasSeccionesAsignaturas);

// Ruta para obtener Asignaturas
router.get('/verAsignaturas', obtenerTodasAsignaturas);

//Rutas para obtener secciones
router.get('/verSecciones', obtenerTodasSecciones);

//Rutas para obtener Grados
router.get('/verGrados', obtenerTodosGrados);

// Ruta para actualizar una sección
router.post('/crearSeccionAsignatura', crearSeccionAsignatura);

// Ruta para obtener secciones
router.put('/actualizarSeccionAsignatura/:Cod_seccion_asignatura', actualizarSeccionAsignatura);

// Ruta para eliminar 
router.delete('/eliminarSeccionAsignatura/:Cod_seccion_asignatura', eliminarSeccionAsignatura);


export default router;