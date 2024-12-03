// catalogoCuentasRoutes.js
import express from 'express';
import {
    agregarCuenta,
    editarCuenta,
    eliminarCuenta,
    obtenerCuentas,
} from '../Contabilidad/Contabilidad_controller.js';


import checkAuth from '../../middleware/Auth_middleware.js'; 


const router = express.Router();

// Ruta para agregar una nueva cuenta
router.post('/',checkAuth, agregarCuenta);

// Ruta para obtener todas las cuentas
router.get('/',checkAuth, obtenerCuentas);

router.put('/:cod_cuenta', checkAuth, editarCuenta);


// Ruta para eliminar una cuenta
router.delete('/:cod_cuenta',checkAuth, eliminarCuenta);

export default router;
