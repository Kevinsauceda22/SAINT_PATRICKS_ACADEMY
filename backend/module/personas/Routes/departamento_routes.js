import express from 'express';
import { obtenerDepartamentosYMunicipios, departamento } from '../controllers/departamentos_controler.js';

const router = express.Router();

// Ruta para obtener departamentos y municipios
router.get('/departamentos-y-municipios', obtenerDepartamentosYMunicipios);
router.get('/departamentos', departamento);

export default router;
