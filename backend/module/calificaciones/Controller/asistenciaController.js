import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


// Obtener asistencias por sección
export const obtenerAsistencias = async (req, res) => {
  const { codSeccion } = req.query; // Obtener `Cod_seccion` de los parámetros de consulta

  try {
      const [rows] = await pool.query('CALL get_all_asistencias(?)', [codSeccion]);
      if (rows[0].length > 0) {
          res.status(200).json(rows[0]);
      } else {
          res.status(404).json({ Mensaje: 'No se encontraron asistencias para esta sección' });
      }
  } catch (error) {
      console.error('Error al obtener las asistencias:', error);
      res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
  }
};


// Crear una nueva asistencia
export const crearAsistencia = async (req, res) => {
  const { Observacion, Cod_estado_asistencia, Cod_seccion_matricula, Fechas } = req.body;

  try {
    // Buscar asistencia existente para la fecha y sección especificadas (comparando solo la parte de la fecha)
    const [existingRows] = await pool.query(
      'SELECT Cod_asistencias, Observacion, Cod_estado_asistencia FROM tbl_asistencias WHERE Cod_seccion_matricula = ? AND DATE(Fecha) = DATE(?)',
      [Cod_seccion_matricula, Fechas] // Compara solo la fecha, no la hora
    );

    if (existingRows.length > 0) {
      const Cod_asistencias = existingRows[0].Cod_asistencias;

      // Determina si hay cambios en Observacion o Cod_estado_asistencia
      const needsUpdate =
        existingRows[0].Observacion !== Observacion ||
        existingRows[0].Cod_estado_asistencia !== Cod_estado_asistencia;

      if (needsUpdate) {
        // Llama al procedimiento de actualización solo si hay cambios
        const [updateResult] = await pool.query('CALL update_asistencia(?, ?, ?, ?, ?)', [
          Cod_asistencias,
          Observacion || null,
          Cod_estado_asistencia || null,
          Cod_seccion_matricula || null,
          Fechas, // Usa "Fechas" aquí para la actualización
        ]);

        // Verifica que se haya actualizado solo un registro
        if (updateResult.affectedRows === 1) {
          return res.status(200).json({
            Mensaje: 'Asistencia actualizada exitosamente',
            tipo: 'actualizacion',
          });
        }
      } else {
        return res.status(200).json({
          Mensaje: 'No hubo cambios para actualizar',
          tipo: 'sin cambios',
        });
      }
    }

    // Si no existe, inserta una nueva asistencia
    await pool.query('CALL insert_asistencia(?, ?, ?, ?)', [
      Observacion,
      Cod_estado_asistencia,
      Cod_seccion_matricula,
      Fechas, // Incluye "Fechas" como parámetro para la inserción
    ]);

    res.status(201).json({ Mensaje: 'Asistencia agregada exitosamente', tipo: 'creacion' });
  } catch (error) {
    console.error('Error al agregar o actualizar la asistencia:', error);
    if (error.code === 'ER_SIGNAL_EXCEPTION') {
      res.status(400).json({ Mensaje: error.sqlMessage });
    } else {
      res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
  }
};

  

export const recuento = async (req, res) => {
  const { codSeccion } = req.query; // Obtener `Cod_seccion` de los parámetros de consulta

  try {
    const [rows] = await pool.query('CALL get_recuento_asistencias(?)', [codSeccion]);
    
    if (rows[0].length > 0) {
      // Mapear los resultados a la estructura deseada
      const recuento = rows[0].map(row => ({
        estado: row.estado,
        cantidad: row.cantidad,
        fecha: row.fecha
      }));
      res.status(200).json(recuento);
    } else {
      res.status(404).json({ Mensaje: 'No se encontraron asistencias para esta sección' });
    }
  } catch (error) {
    console.error('Error al obtener recuento de asistencias:', error);
    res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
  }
};





  


/* Actualizar una asistencia
export const actualizarAsistencia = async (req, res) => {
    const { Cod_asistencias, Fecha, Observacion, Cod_estado_asistencia, Cod_seccion_persona } = req.body;

    try {
        await pool.query('CALL update_asistencia(?, ?, ?, ?, ?)', [
            Cod_asistencias,
            Fecha,
            Observacion,
            Cod_estado_asistencia,
            Cod_seccion_persona
        ]);
        res.status(200).json({ Mensaje: 'Asistencia actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar la asistencia:', error);
        if (error.code === 'ER_SIGNAL_EXCEPTION') {
            res.status(400).json({ Mensaje: error.sqlMessage });
        } else {
            res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
        }
    }
};
*/
// Eliminar una asistencia
export const eliminarAsistencia = async (req, res) => {
    const { Cod_asistencias } = req.body;

    if (!Cod_asistencias) {
        return res.status(400).json({ Mensaje: 'Cod_asistencias es requerido' });
    }

    try {
        await pool.query('CALL delete_asistencia(?)', [Cod_asistencias]);
        res.status(200).json({ Mensaje: 'Asistencia eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar la asistencia:', error);
        if (error.code === 'ER_SIGNAL_EXCEPTION') {
            res.status(400).json({ Mensaje: error.sqlMessage });
        } else {
            res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
        }
    }
};
