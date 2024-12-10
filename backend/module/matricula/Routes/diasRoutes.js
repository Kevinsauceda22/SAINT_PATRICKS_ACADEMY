import express from 'express'; 
import { obtenerDias,
        crearDia,
        actualizarDia,
        eliminarDia
    } from '../Controllers/diasController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router();

// Ruta para obtener todos los dias
router.get('/dias', obtenerDias);

//Ruta para obtener un dia
router.get('/dias/:Cod_dias', obtenerDias);

//Ruta para crear un dia
router.post('/crear_dia', crearDia);

//Ruta para actualizar un día
router.put('/actualizar_dia', actualizarDia);

// Ruta para eliminar un día por el codigo
router.delete('/:cod_dias', eliminarDia);

export default router;