import express from 'express';
import {
  obtenerDepartamentosYMunicipios,
  departamento,
  crearDepartamento,
  editarDepartamento,
  eliminarDepartamento
  
} from '../Controllers/departamentos_controler.js';

import {
    obtenerMunicipios,
    crearMunicipio,
    editarMunicipio,
    eliminarMunicipio,
    obtenerMunicipiosPorDepartamento
  } from '../Controllers/municipio_controller.js';

const router = express.Router();

router.get('/departamentos-y-municipios', obtenerDepartamentosYMunicipios);
router.get('/departamentos',   obtenerDepartamentosYMunicipios);
router.post('/departamentos', crearDepartamento);
router.put('/departamentos/:cod_departamento', editarDepartamento);
router.delete('/departamentos/:cod_departamento', eliminarDepartamento);



// Rutas para municipios
router.get('/municipios', obtenerMunicipios);
router.post('/municipios', crearMunicipio);
router.put('/municipios/:cod_municipio', editarMunicipio);
router.delete('/municipios/:cod_municipio', eliminarMunicipio);
router.get('/municipios/:cod_departamento', obtenerMunicipiosPorDepartamento);




export default router;
