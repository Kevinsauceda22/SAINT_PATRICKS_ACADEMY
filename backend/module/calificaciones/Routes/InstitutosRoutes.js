import express from 'express';
import {
    obtenerInstitutos,
    crearInstituto,
} from '../Controller/institutoController.js'; // Importamos las funciones del controlador

const router = express.Router();


// Ruta para obtener todos los historiales académicos
router.get('/instituto', obtenerInstitutos);

// Ruta para crear un nuevo historial académico
router.post('/crearinstituto', crearInstituto);

export default router;