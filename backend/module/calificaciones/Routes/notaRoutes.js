import express from 'express';
import {
    obtenerSeccion,
    obtenerSeccionesPorProfesor,
    ObtenerPromedioParcialesPorSeccion,
    ObtenerActividadesPorAsignatura,
    crearNota,
    actualizarNota,
    obtenerEstudiantesConTotal,
    obtenerNotasParaEdicion,
    obtenerpromedionotas,
    obtenerNotasPorActividad,
    ObtenerActividadesPorAsignaturaCalificadas,

    obtenerNotasYPromedio
} from '../Controller/notaController.js'; // Importamos las funciones del controlador

const router = express.Router();

// Ruta para obtener todas las notas
router.get('/seccion', obtenerSeccion);

router.get('/notas', ObtenerPromedioParcialesPorSeccion);
router.get('/notas/editar', obtenerNotasParaEdicion);
router.get('/promedio', obtenerpromedionotas);
router.get('/actividades', ObtenerActividadesPorAsignatura);
router.get('/actividadescalificadas', ObtenerActividadesPorAsignaturaCalificadas);
router.get('/notatotal/:Cod_seccion/:Cod_seccion_asignatura/:Cod_parcial', obtenerEstudiantesConTotal);
router.get('/seccionesporprofe', obtenerSeccionesPorProfesor);
router.get('/notasactividad/:codSeccion/:codSeccionAsignatura/:codParcial/:codActividadAsignatura', obtenerNotasPorActividad);
// Ruta para crear una nueva nota
router.post('/crearnota', crearNota);

// Ruta para actualizar una nota
router.put('/actualizarnota', actualizarNota);



// Ruta para obtener las notas y el promedio unificados
router.get('/notasypromedio/:CodSeccionMatricula', obtenerNotasYPromedio);


export default router;

