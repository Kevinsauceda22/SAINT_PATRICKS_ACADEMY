import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


// Obtener todos los historiales acadÃ©micos
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

// Crear un nuevo historial acadÃ©mico
export const crearHistorial = async (req, res) => {
    const {Cod_estado, Estudiante, Grado, Año_Academico, Promedio_Anual, Instituto } = req.body;

    try {
        await pool.query('CALL insert_historial_academico(?, ?, ?, ?, ?, ?)', [
            Cod_estado,
            Estudiante,
            Grado,
            Año_Academico,
            Promedio_Anual,
            Instituto
        ]);
        res.status(201).json({ Mensaje: 'Historial académico agregado exitosamente' });
    } catch (error) {
        console.error('Error al agregar historial académico:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Actualizar un historial acadÃ©mico
export const actualizarHistorial = async (req, res) => {
    const {Cod_historial_academico, Cod_estado, Estudiante, Grado, Año_Academico, Promedio_Anual, Instituto } = req.body;

    try {
        await pool.query('CALL update_historial_academico(?, ?, ?, ?, ?, ?, ?)', [
            Cod_historial_academico,
            Cod_estado,
            Estudiante,
            Grado,
            Año_Academico,
            Promedio_Anual,
            Instituto
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
        await pool.query('CALL delete_historial_academico(?)', [Cod_historial_academico]);
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
