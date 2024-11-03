import express from 'express';
import {
        obtenerEstructuraFamiliar,
        obtenerPersonas,
        obtenerTipoRelacion,
        crearEstructuraFamiliar,
        actualizarEstructuraFamiliar,
        eliminarEstructuraFamiliar
} from '../Controllers/estructuraFamiliarController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router();

// Ruta para obtener todas las estructuras familiares
router.get('/verEstructuraFamiliar', obtenerEstructuraFamiliar);

//Ruta para obtener las personas
router.get('/verPersonas', obtenerPersonas);

//Ruta paar obtener las tipo de relaciones 
router.get('/verTipoRelacion', obtenerTipoRelacion);

//Ruta para crear estructura Familiar
router.post('/crearEstructuraFamiliar',crearEstructuraFamiliar)

// Ruta para 
router.put('/actualizarEstructuraFamiliar/:cod_genealogia', actualizarEstructuraFamiliar);

// Ruta para eliminar 
router.delete('/eliminarestructuraFamiliar/:cod_genealogia', eliminarEstructuraFamiliar);

export default router;