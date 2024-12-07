import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


// Obtener historiales académicos por Cod_persona
export const obtenerHistorialesPorPersona = async (req, res) => {
  const { Cod_persona } = req.params; // Capturar el parámetro de la URL

  try {
      // Validar si se envió el parámetro Cod_persona
      if (!Cod_persona) {
          return res.status(400).json({ Mensaje: 'El código de persona es obligatorio' });
      }

      // Llamada al procedimiento almacenado
      const [rows] = await pool.query('CALL GET_HISTORIAL_POR_PERSONA(?)', [Cod_persona]);

      // Validar si se encontraron resultados
      if (rows[0].length > 0) {
          res.status(200).json(rows[0]); // Retornar los historiales
      } else {
          res.status(404).json({ Mensaje: 'No se encontraron historiales académicos para esta persona' });
      }
  } catch (error) {
      console.error('Error al obtener los historiales académicos por persona:', error);
      res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
  }
};

//Agregar un nuevo historial
export const crearHistorial = async (req, res) => {
  const { 
      Cod_estado, 
      Cod_persona, 
      Cod_grado, 
      Año_Academico, 
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
          Año_Academico,
          Promedio_Anual,
          Cod_Instituto,
          Observacion
      ]);

      // Respuesta exitosa
      res.status(201).json({ Mensaje: 'Historial académico agregado exitosamente' });
  } catch (error) {
      console.error('Error al agregar historial académico:', error);
      // Respuesta con error del servidor
      res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
  }
};

// Actualizar un historial académico
export const actualizarHistorial = async (req, res) => {
    const {Cod_historial_academico, Cod_estado, Cod_persona, Cod_grado, Año_Academico, Promedio_Anual, Cod_Instituto, Observacion } = req.body;

    try {
        await pool.query('CALL UPDATE_HISTORIAL(?, ?, ?, ?, ?, ?, ?, ?)', [
            Cod_historial_academico,
            Cod_estado,
            Cod_persona,
            Cod_grado,
            Año_Academico,
            Promedio_Anual,
            Cod_Instituto,
            Observacion
        ]);
        res.status(200).json({ Mensaje: 'Historial académico actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar historial académico:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Eliminar un historial académico
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
  const { cod_grado } = req.params; // Obtener el parámetro desde la URL

  // Validar el parámetro
  if (!cod_grado || isNaN(cod_grado)) {
    return res.status(400).json({
      success: false,
      message: "El parámetro 'cod_grado' es obligatorio y debe ser un número.",
    });
  }

  try {
    // Llamar al procedimiento almacenado con el parámetro
    const [rows] = await pool.query("CALL ObtenerPersonasPorGrado(?)", [cod_grado]);

    // Responder con los datos obtenidos
    res.status(200).json({
      success: true,
      data: rows[0], // Los resultados están en rows[0]
    });
  } catch (error) {
    console.error("Error al obtener personas por grado:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al obtener las personas del grado.",
    });
  }
};
