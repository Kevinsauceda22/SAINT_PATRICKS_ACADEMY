import express from 'express';
import {
    obtenerMunicipios,
    crearMunicipio,
    editarMunicipio,
    eliminarMunicipio,
    obtenerMunicipiosPorDepartamento

} from '../Controllers/municipioController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router();

// Ruta para obtener 
router.get('/verMunicipios', obtenerMunicipios);

// Ruta para obtener 
router.get('/verMunicipioPorDepartamento', obtenerMunicipiosPorDepartamento);

//Ruta para crear 
router.post('/crearMunicipio', crearMunicipio)

// Ruta para actualizar 
router.put('/actualizarMunicipios/:Cod_municipio', editarMunicipio);

// Ruta para eliminar 
router.delete('/eliminarEstructuraFamiliar/:Cod_municipio', eliminarMunicipio);

export default router;
