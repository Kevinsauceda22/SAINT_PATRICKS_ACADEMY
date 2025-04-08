import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


// Obtener todos los historiales académicos
export const obtenerHistoriales = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL get_all_historiales_academicos()');
        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron historiales académicos' });
        }
    } catch (error) {
        console.error('Error al obtener los historiales académicos:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Crear un nuevo historial académico
export const crearHistorial = async (req, res) => {
    const {Cod_estado, Cod_persona, Cod_grado, Año_Academico, Promedio_Anual, Cod_Instituto, Observacion } = req.body;

    try {
        await pool.query('CALL INSERT_HISTORIAL(?, ?, ?, ?, ?, ?, ?)', [
            Cod_estado,
            Cod_persona,            
            Cod_grado,
            Año_Academico,
            Promedio_Anual,
            Cod_Instituto,
            Observacion
        ]);
        res.status(201).json({ Mensaje: 'Historial académico agregado exitosamente' });
      } catch (error) {
          console.error('Error al agregar historial académico:', error);
      
          // Diferenciar errores de MySQL (SIGNAL o restricciones)
          if (error.sqlState === '45000') {
              res.status(400).json({ Mensaje: error.sqlMessage });
          } else {
              // Otros errores del servidor
              res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
          }
      }

    }

export const getAllEstadoNota = async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM tbl_estado_nota');
    res.status(200).json(results);
  } catch (error) {
    console.error('Error al obtener los estados de nota:', error);
    res.status(500).json({ message: 'Error al obtener los estados de nota' });
  }
};
// Actualizar un historial académico
export const actualizarHistorial = async (req, res) => {
    const {
        Cod_historial_academico,
        Cod_estado,
        Cod_persona,
        Cod_grado,
        Año_Academico,
        Promedio_Anual,
        Cod_Instituto,
        Observacion
    } = req.body;

    try {
        // Llamar al procedimiento almacenado de actualización
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

        // Respuesta en caso de éxito
        res.status(200).json({ Mensaje: 'Historial académico actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar historial académico:', error);

        // Manejo de errores específicos de MySQL
        if (error.sqlState === '45000') {
            // Mensajes definidos en el procedimiento almacenado
            res.status(400).json({ Mensaje: error.sqlMessage });
        } else {
            // Otros errores del servidor
            res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
        }
    }
};


// Eliminar un historial académico
export const eliminarHistorial = async (req, res) => {
  const { Cod_historial_academico } = req.body;

  try {
      // Llama al procedimiento almacenado usando CALL
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
  const { cod_grado, anio_academico } = req.params; // Obtener el parámetro desde la URL

  if (!anio_academico || isNaN(anio_academico)) {
  return res.status(400).json({
    success: false,
    message: "El parámetro 'anio_academico' es obligatorio y debe ser un número.",
  });
}

  // Validar el parámetro
  if (!cod_grado || isNaN(cod_grado)) {
    return res.status(400).json({
      success: false,
      message: "El parámetro 'cod_grado' es obligatorio y debe ser un número.",
    });
  }

  try {
    // Llamar al procedimiento almacenado con el parámetro
    const [rows] = await pool.query("CALL ObtenerPersonasPorGrado(?,?)", [cod_grado, anio_academico]);

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


export const obtenerHistorialPorPersona = async (req, res) => {
  const { Cod_persona } = req.params;

  // Validación inicial
  if (!Cod_persona || isNaN(Cod_persona)) {
    console.error('Cod_persona es requerido y debe ser un número válido.');
    return res.status(400).json({ 
      error: true, 
      message: 'Parámetro inválido.' 
    });
  }

  try {
    // Llamada al procedimiento almacenado, pasando el parámetro como p_Cod_persona
    const [rows] = await pool.query('CALL ObtenerHistorialPorPersona(?)', [Cod_persona]);

    // Verifica si los resultados existen
    console.log('Resultado de la consulta:', rows); // Verifica los datos que llegan desde la base de datos

    if (!rows || rows.length === 0) {
      console.error(`No se encontró historial para Cod_persona: ${Cod_persona}`);
      return res.status(404).json({ 
        error: true, 
        message: 'No se encontró historial académico para esta persona.' 
      });
    }

    // Si hay resultados, devolver los datos
    return res.status(200).json({
      success: true,
      message: 'Historial académico obtenido con éxito.',
      data: rows
    });
    
  } catch (error) {
    // Manejo de errores
    console.error('Error al obtener historial académico:', error);
    return res.status(500).json({
      error: true,
      message: 'Error interno. Por favor, intente más tarde.'
    });
  }
};
