import express from 'express';
import {
  obtenerRegistrosCaja,
  obtenerRegistroCajaPorCod,
  registrarPago,
  obtenerMatriculasPendientesPorDniPadre,
  obtenerMatriculasPagadas,
  obtenerConceptos,
  obtenerTodasLasMatriculasPendientes,
  obtenerDetallesRecibo,
  insertarCajaOficialConDescuento,
  obtenerTodasLasCajasPendientes,
  obtenerValorMatricula,
  obtenerConceptoMatricula,
  obtenerDescuentos,
  buscarCajasPorDni,
} from '../Controllers/cajaController.js';

const router = express.Router();

// Ruta para obtener todos los registros de la caja
router.get('/caja', obtenerRegistrosCaja);

// Ruta para obtener un registro específico de la caja por `cod_caja`
router.get('/caja/:cod_caja', obtenerRegistroCajaPorCod);

// Ruta para registrar un pago en la caja
router.post('/pago', registrarPago);

// Ruta para obtener matrículas pendientes por DNI del padre
router.get('/matriculas-pendientes/:dni_padre', obtenerMatriculasPendientesPorDniPadre);

// Ruta para obtener matrículas pagadas
router.get('/matriculas-pagadas', obtenerMatriculasPagadas);

// Ruta para obtener conceptos de pago
router.get('/conceptos', obtenerConceptos);

// Ruta para obtener todas las matrículas pendientes
router.get('/matriculas-pendientes', obtenerTodasLasMatriculasPendientes);

// Ruta para obtener los detalles del recibo
router.get('/recibo/:cod_caja', obtenerDetallesRecibo);

// Ruta para insertar una caja oficial
router.post('/oficial', insertarCajaOficialConDescuento);

// Ruta para obtener todas las cajas pendientes con el nombre del padre
router.get('/todas-pendientes', obtenerTodasLasCajasPendientes);

// Ruta para obtener el valor del parámetro "Matricula"
router.get('/parametro/Matricula', obtenerValorMatricula);

// Ruta para obtener el concepto "Matricula"
router.get('/concepto/matricula', obtenerConceptoMatricula);

// Ruta para obtener descuentos
router.get('/descuentos', obtenerDescuentos);

// Ruta para buscar cajas por DNI
router.get('/buscar-por-dni', buscarCajasPorDni);

export default router;
