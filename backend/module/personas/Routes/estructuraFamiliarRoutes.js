import express from 'express';
import {
        obtenerEstructuraFamiliar,
        obtenerEstructurasFamiliares,
        obtenerPersonas,
        obtenerPersonasPorRol,
        obtenerTipoRelacion,
        crearEstructuraFamiliar,
        actualizarEstructuraFamiliar,
        eliminarEstructuraFamiliar
} from '../Controllers/estructuraFamiliarController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router();

// Ruta para obtener todas las estructuras familiares
router.get('/verEstructuraFamiliar', obtenerEstructuraFamiliar);

// Ruta para obtener una estructura familiar de la persona seleccionada 
router.get('/verEstructuraFamiliar/:cod_persona', obtenerEstructurasFamiliares);

//Ruta para obtener las personas
router.get('/verPersonas', obtenerPersonas);

//Ruta para obtener las personas por rol 
router.get('/verPersonas/:rol', obtenerPersonasPorRol);

//Ruta paar obtener las tipo de relaciones 
router.get('/verTipoRelacion', obtenerTipoRelacion);

//Ruta para crear estructura Familiar
router.post('/crearEstructuraFamiliar',crearEstructuraFamiliar)

// Ruta para actualizar estructura
router.put('/actualizarEstructuraFamiliar/:Cod_genealogia', actualizarEstructuraFamiliar);

// Ruta para eliminar 
router.delete('/eliminarEstructuraFamiliar/:Cod_genealogia', eliminarEstructuraFamiliar);

export default router;