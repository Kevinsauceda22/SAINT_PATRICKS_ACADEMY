import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


// Obtener asistencias por sección
export const obtenerAsistencias = async (req, res) => {
  const { cod_seccion,fecha } = req.query; // Obtener `Cod_seccion` de los parámetros de consulta

  try {
      const [rows] = await pool.query('CALL get_all_asistencias(?,?)', [cod_seccion, fecha]);
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
  const asistencias = req.body; // Array de objetos con las asistencias a insertar

  try {
    // Verificar que asistencias sea un array y tenga elementos
    if (!Array.isArray(asistencias) || asistencias.length === 0) {
      return res.status(400).json({ Mensaje: 'No se enviaron asistencias para insertar' });
    }

    // Realizar inserciones para cada asistencia en el array
    for (const asistencia of asistencias) {
      const { Observacion, Cod_estado_asistencia, Cod_seccion_matricula, Fechas } = asistencia;

      // Ejecutar el procedimiento almacenado para insertar cada asistencia
      await pool.query('CALL insert_asistencia(?, ?, ?, ?)', [
        Observacion,
        Cod_estado_asistencia,
        Cod_seccion_matricula,
        Fechas,
      ]);
    }

    res.status(201).json({ Mensaje: 'Asistencias agregadas exitosamente', tipo: 'creacion' });
  } catch (error) {
    console.error('Error al agregar asistencias:', error);
    res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
  }
};
  

// Verificar si existen asistencias para una fecha y sección
export const verificarExistenciaAsistencias = async (req, res) => {
  const { fecha, codSeccion } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM tbl_asistencias WHERE Cod_seccion_matricula = ? AND DATE(Fecha) = DATE(?)',
      [codSeccion, fecha]
    );

    const existe = rows[0].count > 0;
    res.status(200).json({ existe });
  } catch (error) {
    console.error('Error al verificar existencia de asistencias:', error);
    res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
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





  

export const actualizarAsistencia = async (req, res) => {
  const asistencias = req.body; // Array de objetos con las asistencias a actualizar

  try {
    // Verificar que asistencias sea un array y tenga elementos
    if (!Array.isArray(asistencias) || asistencias.length === 0) {
      return res.status(400).json({ Mensaje: 'No se enviaron asistencias para actualizar' });
    }

    // Realizar actualizaciones para cada asistencia en el array
    for (const asistencia of asistencias) {
      const {
        Cod_asistencias,
        Observacion,
        Cod_estado_asistencia,
        Cod_seccion_matricula
      } = asistencia;

      // Ejecutar el procedimiento almacenado para actualizar cada asistencia
      const [result] = await pool.query('CALL update_asistencia(?, ?, ?, ?)', [
        Cod_asistencias,
        Observacion || null,
        Cod_estado_asistencia || null,
        Cod_seccion_matricula || null
      ]);

      // Verificar que se haya actualizado solo un registro
      if (result.affectedRows === 0) {
        throw new Error(
          `No se pudo actualizar la asistencia con Cod_asistencias: ${Cod_asistencias}`
        );
      }
    }

    res.status(200).json({ Mensaje: 'Asistencias actualizadas exitosamente', tipo: 'actualizacion' });
  } catch (error) {
    console.error('Error al actualizar asistencias:', error);
    res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
  }
};



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
