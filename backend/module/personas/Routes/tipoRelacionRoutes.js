import express from 'express';
import {
        obtenerTodoTipoRelacion,
        crearTipoRelacion,
        actualizarTipoRelacion,
        eliminarTipoRelacion
} from '../Controllers/tipoRelacionController.js'; // Asegúrate de que esta ruta sea correcta

const router = express.Router();

// Ruta para obtener todas los tipo relacion
router.get('/verTodoTipoRelacion', obtenerTodoTipoRelacion);

//Ruta para crear tipo relacion
router.post('/crearTipoRelacion',crearTipoRelacion)

// Ruta para actualizar tipo relacion
router.put('/actualizarTipoRelacion/:Cod_tipo_relacion', actualizarTipoRelacion);

// Ruta para eliminar una actividad por Cod_actividad
router.delete('/eliminarTipoRelacion/:Cod_tipo_relacion', eliminarTipoRelacion); // Nueva ruta para eliminar actividad

export default router;