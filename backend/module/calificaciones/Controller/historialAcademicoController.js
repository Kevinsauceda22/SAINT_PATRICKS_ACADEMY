import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


// Obtener historiales acadÃ©micos por Cod_persona
export const obtenerHistorialesPorPersona = async (req, res) => {
  const { Cod_persona } = req.params; // Capturar el parÃ¡metro de la URL

  try {
      // Validar si se enviÃ³ el parÃ¡metro Cod_persona
      if (!Cod_persona) {
          return res.status(400).json({ Mensaje: 'El cÃ³digo de persona es obligatorio' });
      }

      // Llamada al procedimiento almacenado
      const [rows] = await pool.query('CALL GET_HISTORIAL_POR_PERSONA(?)', [Cod_persona]);

      // Validar si se encontraron resultados
      if (rows[0].length > 0) {
          res.status(200).json(rows[0]); // Retornar los historiales
      } else {
          res.status(404).json({ Mensaje: 'No se encontraron historiales acadÃ©micos para esta persona' });
      }
  } catch (error) {
      console.error('Error al obtener los historiales acadÃ©micos por persona:', error);
      res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
  }
};

//Agregar un nuevo historial
export const crearHistorial = async (req, res) => {
  const { 
      Cod_estado, 
      Cod_persona, 
      Cod_grado, 
      AÃ±o_Academico, 
      Promedio_Anual, 
      Cod_Instituto, 
      Observacion 
  } = req.body;

  try {
      // Ejecuta el procedimiento almacenado
      await pool.query('CALL INSERT_HISTORIAL(?, ?, ?, ?, ?, ?, ?)', [
          Cod_estado,
          Cod_persona,
          Cod_grado,
          AÃ±o_Academico,
          Promedio_Anual,
          Cod_Instituto,
          Observacion
      ]);

      // Respuesta exitosa
      res.status(201).json({ Mensaje: 'Historial acadÃ©mico agregado exitosamente' });
  } catch (error) {
      console.error('Error al agregar historial acadÃ©mico:', error);
      // Respuesta con error del servidor
      res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
  }
};

// Actualizar un historial acadÃ©mico
export const actualizarHistorial = async (req, res) => {
    const {Cod_historial_academico, Cod_estado, Cod_persona, Cod_grado, AÃ±o_Academico, Promedio_Anual, Cod_Instituto, Observacion } = req.body;

    try {
        await pool.query('CALL UPDATE_HISTORIAL(?, ?, ?, ?, ?, ?, ?, ?)', [
            Cod_historial_academico,
            Cod_estado,
            Cod_persona,
            Cod_grado,
            AÃ±o_Academico,
            Promedio_Anual,
            Cod_Instituto,
            Observacion
        ]);
        res.status(200).json({ Mensaje: 'Historial acadÃ©mico actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar historial acadÃ©mico:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Eliminar un historial acadÃ©mico
export const eliminarHistorial = async (req, res) => {
    const { Cod_historial_academico } = req.body;

    try {
        await pool.query('CALL DELETE_HISTORIAL(?)', [Cod_historial_academico]);
        res.status(200).json({ Mensaje: 'Historial eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el historial:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

export const obtenerGradosMatricula = async (req, res) => {
    try {
      // Conectar a la base de datos
      const [rows] = await pool.query('CALL ObtenerGradosMatricula()');
  
      // Devolver la respuesta con los datos
      res.status(200).json({
        success: true,
        data: rows[0], // Los resultados del procedimiento se encuentran en rows[0]
      });
    } catch (error) {
      console.error('Error al obtener los grados:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error al obtener los grados',
      });
    }
  };

export const obtenerPersonasPorGrado = async (req, res) => {
  const { cod_grado } = req.params; // Obtener el parÃ¡metro desde la URL

  // Validar el parÃ¡metro
  if (!cod_grado || isNaN(cod_grado)) {
    return res.status(400).json({
      success: false,
      message: "El parÃ¡metro 'cod_grado' es obligatorio y debe ser un nÃºmero.",
    });
  }

  try {
    // Llamar al procedimiento almacenado con el parÃ¡metro
    const [rows] = await pool.query("CALL ObtenerPersonasPorGrado(?)", [cod_grado]);

    // Responder con los datos obtenidos
    res.status(200).json({
      success: true,
      data: rows[0], // Los resultados estÃ¡n en rows[0]
    });
  } catch (error) {
    console.error("Error al obtener personas por grado:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al obtener las personas del grado.",
    });
  }
};
