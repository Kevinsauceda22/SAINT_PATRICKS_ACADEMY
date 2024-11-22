import express from 'express';
import {
    obtenerInstitutos,
    crearInstituto,
    actualizarinstituto,
    eliminarinstituto,
} from '../Controller/institutoController.js'; // Importamos las funciones del controlador

const router = express.Router();


// Ruta para obtener todos los institutos
router.get('/instituto', obtenerInstitutos);

// Ruta para crear un nuevo instituto
router.post('/crearinstituto', crearInstituto);

//Ruta para actualizar un instituto
router.put('/actualizarinstituto', actualizarinstituto);

//Ruta para eliminar un instituto
router.delete('/eliminarinstituto', eliminarinstituto)

export default router;
