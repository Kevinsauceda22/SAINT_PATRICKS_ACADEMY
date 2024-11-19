import conectarDB from '../../config/db.js';
const pool = await conectarDB();


// Función para agregar un nuevo registro en el libro diario
export const agregarRegistro = async (req, res) => {
    const { Fecha, Descripcion, Cod_cuenta, Monto, Tipo } = req.body;
  
    // Verificar que todos los campos estén presentes
    if (!Fecha || !Descripcion || !Cod_cuenta || !Monto || !Tipo) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
  
    try {
      const pool = await conectarDB(); // Obtener el pool de conexiones
  
      console.log('Datos recibidos en el backend:', { Fecha, Descripcion, Cod_cuenta, Monto, Tipo });
  
      // Ejecutamos el procedimiento almacenado
      const [result] = await pool.query('CALL sp_agregar_libro_diario(?, ?, ?, ?, ?)', [Fecha, Descripcion, Cod_cuenta, Monto, Tipo]);
  
      // Devolver la respuesta con el código del libro diario agregado
      res.status(201).json({ cod_libro_diario: result[0].Cod_libro_diario });
    } catch (error) {
      console.error('Error al agregar el registro:', error);
      res.status(500).json({ error: 'Error al agregar el registro en el libro diario' });
    }
  };

// Función para editar un registro del libro diario
export const editarRegistro = async (req, res) => {
  const { cod_libro_diario } = req.params;
  const { Fecha, Descripcion, Cod_cuenta, Monto, Tipo } = req.body;

  // Validación de tipo de 'Tipo' para asegurar que sea uno de los valores válidos del ENUM
  if (Tipo !== 'DEUDOR' && Tipo !== 'ACREEDOR') {
      return res.status(400).json({ error: "El tipo debe ser 'DEUDOR' o 'ACREEDOR'" });
  }

  // Validar que 'Monto' es un número positivo
  if (isNaN(Monto) || Monto <= 0) {
      return res.status(400).json({ error: "Monto debe ser un número válido mayor a cero" });
  }

  // Validar que 'Cod_cuenta' sea un número entero
  if (isNaN(Cod_cuenta) || !Number.isInteger(Number(Cod_cuenta))) {
      return res.status(400).json({ error: "Cod_cuenta debe ser un número entero" });
  }

  try {
      // Ejecutar el procedimiento almacenado
      const result = await pool.query(
          'CALL sp_editar_libro_diario(?, ?, ?, ?, ?, ?)',
          [cod_libro_diario, Fecha, Descripcion, Cod_cuenta, Monto, Tipo]
      );

      // Verifica si la actualización fue exitosa, dependiendo de la respuesta del procedimiento
      if (result.affectedRows > 0) {
          res.status(200).json({ message: 'Registro actualizado correctamente' });
      } else {
          res.status(404).json({ error: 'No se encontró el registro para actualizar' });
      }
  } catch (error) {
      console.error('Error al actualizar el registro:', error);
      res.status(500).json({ error: 'Error al editar el registro en el libro diario' });
  }
};



// Función para eliminar un registro del libro diario
export const eliminarRegistro = async (req, res) => {
  const { Cod_libro_diario } = req.params;

  try {
    const pool = await conectarDB(); // Obtener el pool de conexiones

    // Ejecutamos el procedimiento almacenado para eliminar el registro
    await pool.query('CALL sp_eliminar_libro_diario(?)', [Cod_libro_diario]);
    res.status(200).json({ message: 'Registro eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el registro:', error);
    res.status(500).json({ error: 'Error al eliminar el registro en el libro diario' });
  }
};

// Función para obtener todos los registros del libro diario
export const obtenerRegistros = async (req, res) => {
  try {
    const pool = await conectarDB(); // Obtener el pool de conexiones

    // Realizamos la consulta para obtener los registros del libro diario
    const [rows] = await pool.query('SELECT * FROM tbl_libro_diario');

    // Si no hay registros, devolver mensaje adecuado
    if (rows.length === 0) {
      return res.status(200).json({ message: 'No hay registros disponibles' });
    }

    // Devolvemos los registros en formato JSON
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener los registros:', error);
    // Si hay un error, devolvemos un error 500 con el mensaje adecuado
    res.status(500).json({ error: 'Error al obtener los registros del libro diario' });
  }
};

export default {
  agregarRegistro,
  editarRegistro,
  eliminarRegistro,
  obtenerRegistros
};