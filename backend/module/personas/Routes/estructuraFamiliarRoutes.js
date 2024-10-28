import express from 'express';
import {
        obtenerEstructuraFamiliar,
        //verDetalleEstructuraFamiliar,
        obtenerPersonas,
        obtenerTipoRelacion,
        crearEstructuraFamiliar,
        actualizarEstructuraFamiliar,
        eliminarEstructuraFamiliar
} from '../Controllers/estructuraFamiliarController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router();

// Ruta para obtener todas las estructuras familiares
router.get('/verEstructuraFamiliar', obtenerEstructuraFamiliar);

// Ruta para obtener todas las estructuras familiares por codigo
//router.get('/verDetalleEstructuraFamiliar/:Cod_genialogia', verDetalleEstructuraFamiliar

//Ruta para obtener las personas
router.get('/verPersonas', obtenerPersonas);

//Ruta paar obtener las tipo de relaciones 
router.get('/verTipoRelacion', obtenerTipoRelacion);

//Ruta para crear estructura Familiar
router.post('/crearEstructuraFamiliar',crearEstructuraFamiliar)

// Ruta para 
router.put('/actualizarEstructuraFamiliar/:Cod_genialogia', actualizarEstructuraFamiliar);

// Ruta para eliminar 
router.delete('/eliminarestructuraFamiliar/:Cod_genialogia', eliminarEstructuraFamiliar);

export default router;