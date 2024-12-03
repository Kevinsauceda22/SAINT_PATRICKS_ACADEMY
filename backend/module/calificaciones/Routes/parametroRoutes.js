import express from 'express';
import {
    mostrarParametros,
    registrarParametro,
    actualizarParametro
} from '../Controller/parametroController.js'; // Importamos las funciones del controlador

const router = express.Router();

router.get('/parametro', mostrarParametros);
router.post('/crearparametro', registrarParametro);
router.put('/actualizarparametro', actualizarParametro);
export default router;

