import express from 'express';
import {
        obtenerPersonas,
        obtenerFichaEstudiante,
        obtenerDepartamentos,
        obtenerMunicipiosConDepartamento,
        obtenerTipoPersona,
        obtenerGeneros,
        crearPersona,
        actualizarPersona,
        actualizarEstadoPersona,
        eliminarPersona,

} from '../Controllers/personasController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router();

//Ruta para obtener todas las personas
router.get('/verPersonas', obtenerPersonas);

//Ruta para obtener todas las personas
router.get('/verFichaEstudiante/:cod_persona', obtenerFichaEstudiante);

//Ruta para obtener todos los departamentos
router.get('/verDepartamentos', obtenerDepartamentos);

//Ruta para obtener todos los departamentos
router.get('/verMunicipios', obtenerMunicipiosConDepartamento);

//Ruta para obtener todos los tipos de personas
router.get('/verTipoPersona', obtenerTipoPersona);

//Ruta para obtener todos los generos 
router.get('/verGeneros', obtenerGeneros);

//Ruta para obtener las personas
router.post('/crearPersona', crearPersona);

//Ruta para obtener las personas por rol 
router.put('/actualizarPersona/:cod_persona', actualizarPersona);


router.post('/actualizarEstadoPersona', actualizarEstadoPersona);


//Ruta paar obtener las tipo de relaciones 
router.delete('/eliminarPersona/:cod_persona', eliminarPersona);

export default router;