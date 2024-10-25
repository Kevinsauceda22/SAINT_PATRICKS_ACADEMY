// personasRoutes.js

import express from 'express';
import personasController from '../personas/persona_controller.js'; // Asegúrate de que la ruta es correcta

const router = express.Router();

// Rutas para personas
router.get('/', personasController.getAllPersonas);
router.get('/:cod_persona', personasController.getPersonaById);
router.post('/', personasController.createPersona);
router.put('/:cod_persona', personasController.updatePersona);
router.delete('/:cod_persona', personasController.deletePersona);

export default router;
