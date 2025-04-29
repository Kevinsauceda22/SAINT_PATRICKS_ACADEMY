// Controllers/tipomatriculaController.js

import conectarDB from '../../../config/db.js';

const pool = await conectarDB();

// Crear Tipo de Matrícula
export const crearTipoMatricula = async (req, res) => {
  const { Tipo } = req.body;

  try {
    const [existingTipos] = await pool.query('SELECT * FROM tbl_tipo_matricula WHERE Tipo = ?', [Tipo]);
    if (existingTipos.length > 0) {
      return res.status(400).json({ Mensaje: 'El tipo de matrícula ya existe.' });
    }

    await pool.query('INSERT INTO tbl_tipo_matricula (Tipo, estado) VALUES (?, ?)', [Tipo, 1]);

    const [nuevoTipo] = await pool.query('SELECT * FROM tbl_tipo_matricula WHERE Tipo = ?', [Tipo]);

    if (!nuevoTipo || nuevoTipo.length === 0) {
      throw new Error('Error al obtener el tipo de matrícula recién creado.');
    }

    res.status(201).json(nuevoTipo[0]);
  } catch (error) {
    console.error('Error al crear tipo de matrícula:', error.message);
    res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
  }
};

// Actualizar Tipo de Matrícula
export const actualizarTipoMatricula = async (req, res) => {
  const { p_cod_tipo_matricula } = req.params;
  const { Tipo } = req.body;

  try {
    const [existingTipos] = await pool.query(
      'SELECT * FROM tbl_tipo_matricula WHERE Tipo = ? AND Cod_tipo_matricula != ?',
      [Tipo, p_cod_tipo_matricula]
    );
    if (existingTipos.length > 0) {
      return res.status(400).json({ Mensaje: 'El tipo de matrícula ya existe.' });
    }

    await pool.query('UPDATE tbl_tipo_matricula SET Tipo = ? WHERE Cod_tipo_matricula = ?', [Tipo, p_cod_tipo_matricula]);

    const [tipoActualizado] = await pool.query('SELECT * FROM tbl_tipo_matricula WHERE Cod_tipo_matricula = ?', [p_cod_tipo_matricula]);

    if (!tipoActualizado || tipoActualizado.length === 0) {
      throw new Error('Error al obtener el tipo de matrícula actualizado.');
    }

    res.status(200).json(tipoActualizado[0]);
  } catch (error) {
    console.error('Error al actualizar tipo de matrícula:', error.message);
    res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
  }
};

// Eliminar Tipo de Matrícula
export const eliminarTipoMatricula = async (req, res) => {
  const { p_cod_tipo_matricula } = req.params;

  try {
    await pool.query('DELETE FROM tbl_tipo_matricula WHERE Cod_tipo_matricula = ?', [p_cod_tipo_matricula]);

    res.status(200).json({ Mensaje: 'Tipo de matrícula eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar tipo de matrícula:', error.message);
    res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
  }
};

// Consultar Tipos de Matrícula
export const consultarTipoMatricula = async (req, res) => {
  const { p_cod_tipo_matricula } = req.params;

  try {
    let result;
    if (p_cod_tipo_matricula) {
      [result] = await pool.query('SELECT * FROM tbl_tipo_matricula WHERE Cod_tipo_matricula = ?', [p_cod_tipo_matricula]);
    } else {
      [result] = await pool.query('SELECT * FROM tbl_tipo_matricula');
    }

    if (!result || result.length === 0) {
      return res.status(404).json({ Mensaje: 'Tipo de matrícula no encontrado' });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error al consultar tipos de matrícula:', error.message);
    res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
  }
};

// Cambiar Estado de Tipo de Matrícula
export const cambiarEstadoTipoMatricula = async (req, res) => {
  const { p_cod_tipo_matricula } = req.params;
  const { p_estado } = req.body;

  try {
    await pool.query('UPDATE tbl_tipo_matricula SET estado = ? WHERE Cod_tipo_matricula = ?', [p_estado, p_cod_tipo_matricula]);
    res.status(200).json({ Mensaje: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('Error al cambiar estado del tipo de matrícula:', error.message);
    res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
  }
};
