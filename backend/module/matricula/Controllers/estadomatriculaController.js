// Controllers/estadoMatriculaController.js

import conectarDB from '../../../config/db.js';

const pool = await conectarDB();

// Crear Estado de Matrícula
export const crearEstadoMatricula = async (req, res) => {
  const { p_tipo } = req.body;

  const tiposValidos = ['Activa', 'Cancelada', 'Pendiente', 'Inactiva'];
  if (!tiposValidos.includes(p_tipo)) {
    return res.status(400).json({ Mensaje: 'Tipo inválido. Los tipos permitidos son: ' + tiposValidos.join(', ') });
  }

  try {
    const [existingEstado] = await pool.query('SELECT * FROM tbl_estado_matricula WHERE Tipo = ?', [p_tipo]);
    if (existingEstado.length > 0) {
      return res.status(400).json({ Mensaje: 'El estado de matrícula ya existe' });
    }

    await pool.query('INSERT INTO tbl_estado_matricula (Tipo, estado) VALUES (?, ?)', [p_tipo, 'activo']);

    res.status(201).json({ Mensaje: 'Estado de matrícula creado exitosamente' });
  } catch (error) {
    console.error('Error al crear el estado de matrícula:', error);
    res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
  }
};

// Actualizar Estado de Matrícula
export const actualizarEstado = async (req, res) => {
  const { p_cod_estado_matricula, p_tipo } = req.body;

  const tiposValidos = ['Activa', 'Cancelada', 'Pendiente', 'Inactiva'];
  if (!tiposValidos.includes(p_tipo)) {
    return res.status(400).json({ Mensaje: 'Tipo inválido. Los tipos permitidos son: ' + tiposValidos.join(', ') });
  }

  try {
    const [existingEstado] = await pool.query('SELECT * FROM tbl_estado_matricula WHERE Tipo = ? AND Cod_estado_matricula != ?', [p_tipo, p_cod_estado_matricula]);
    if (existingEstado.length > 0) {
      return res.status(400).json({ Mensaje: 'El estado de matrícula ya existe' });
    }

    await pool.query('UPDATE tbl_estado_matricula SET Tipo = ? WHERE Cod_estado_matricula = ?', [p_tipo, p_cod_estado_matricula]);

    res.status(200).json({ Mensaje: 'Estado de matrícula actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar el estado de matrícula:', error);
    res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
  }
};

// Eliminar Estado de Matrícula
export const eliminarEstadoMatricula = async (req, res) => {
  const { p_cod_estado_matricula } = req.params;

  try {
    await pool.query('DELETE FROM tbl_estado_matricula WHERE Cod_estado_matricula = ?', [p_cod_estado_matricula]);

    res.status(200).json({ Mensaje: 'Estado de matrícula eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar el estado de matrícula:', error);
    res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
  }
};

// Obtener Estados de Matrícula
export const obtenerEstadoMatricula = async (req, res) => {
  const { cod_estado_matricula } = req.params;

  try {
    let result;
    if (cod_estado_matricula) {
      [result] = await pool.query('SELECT * FROM tbl_estado_matricula WHERE Cod_estado_matricula = ?', [cod_estado_matricula]);
    } else {
      [result] = await pool.query('SELECT * FROM tbl_estado_matricula');
    }

    if (!result || result.length === 0) {
      return res.status(404).json({ Mensaje: 'Estado de matrícula no encontrado' });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error al obtener el estado de matrícula:', error);
    res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
  }
};

// Cambiar Estado Activo/Inactivo de Estado de Matrícula
export const cambiarEstadoEstadoMatricula = async (req, res) => {
  const { p_cod_estado_matricula } = req.params;
  const { p_estado } = req.body;

  try {
    await pool.query('UPDATE tbl_estado_matricula SET estado = ? WHERE Cod_estado_matricula = ?', [p_estado, p_cod_estado_matricula]);

    res.status(200).json({ Mensaje: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('Error al cambiar estado del estado de matrícula:', error);
    res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
  }
};
