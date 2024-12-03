import express from 'express';
import {
    obtenerPonderacionesCiclos,
    crearPonderacionesCiclos,
    actualizarPonderacionesCiclos,
    eliminarPonderacionesCiclos,
    getPonderacionesCiclos,
    obtenerCicloPorPonderacionCiclo 
} from '../Controller/Ponderaciones_ciclosController.js'; // Importamos las funciones del controlador

const router = express.Router();

// Ruta para obtener las ponderaciones de un ciclo específico
router.get('/verPonderacionesCiclos/:Cod_ciclo', obtenerPonderacionesCiclos);
// Ruta para obtener todas las ponderaciones de ciclos
router.get('/verPonderacionesCiclos', getPonderacionesCiclos);
// Otras rutas...
router.post('/crearPonderacionesCiclos', crearPonderacionesCiclos);
router.put('/actualizarPonderacionesCiclos', actualizarPonderacionesCiclos);
router.delete('/eliminarPonderacionesCiclos', eliminarPonderacionesCiclos);



// Ruta para obtener el Cod_ciclo
router.get("/ciclo", obtenerCicloPorPonderacionCiclo);

export default router;