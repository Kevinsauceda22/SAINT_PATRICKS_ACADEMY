import conectarDB from '../../../config/db.js';

// Controlador para obtener los municipios
export const obtenerMunicipios = async (req, res) => {
  try {
    // Obtener la conexión del pool
    const pool = await conectarDB();

    // Consulta SQL para obtener los municipios con el nombre del departamento
    const [rows] = await pool.query(`
      SELECT 
        m.cod_municipio, 
        m.nombre_municipio, 
        m.cod_departamento, 
        d.nombre_departamento
      FROM 
        tbl_municipio m
        JOIN tbl_departamento d ON m.cod_departamento = d.cod_departamento
    `);

    // Verificar si hay resultados
    if (rows.length > 0) {
      res.status(200).json(rows); // Retornar los resultados
    } else {
      res.status(404).json({ message: 'No se encontraron municipios' });
    }
  } catch (error) {
    console.error('Error al obtener municipios:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Controlador para crear un municipio
export const crearMunicipio = async (req, res) => {
  const { nombre_municipio, cod_departamento } = req.body;

  try {
    // Obtener la conexión del pool
    const pool = await conectarDB();

    // Consulta SQL para crear un nuevo municipio
    const [result] = await pool.query(`
      INSERT INTO tbl_municipio (nombre_municipio, cod_departamento)
      VALUES (?, ?)
    `, [nombre_municipio, cod_departamento]);

    // Verificar si se creó el municipio
    if (result.affectedRows > 0) {
      res.status(201).json({ message: 'Municipio creado exitosamente', cod_municipio: result.insertId });
    } else {
      res.status(400).json({ message: 'Error al crear el municipio' });
    }
  } catch (error) {
    console.error('Error al crear el municipio:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Controlador para editar un municipio
export const editarMunicipio = async (req, res) => {
  const { cod_municipio } = req.params;
  const { nombre_municipio, cod_departamento } = req.body;

  try {
    // Obtener la conexión del pool
    const pool = await conectarDB();

    // Consulta SQL para actualizar un municipio
    const [result] = await pool.query(`
      UPDATE tbl_municipio
      SET nombre_municipio = ?, cod_departamento = ?
      WHERE cod_municipio = ?
    `, [nombre_municipio, cod_departamento, cod_municipio]);

    // Verificar si se actualizó el municipio
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Municipio actualizado exitosamente' });
    } else {
      res.status(404).json({ message: 'No se encontró el municipio' });
    }
  } catch (error) {
    console.error('Error al editar el municipio:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Controlador para eliminar un municipio
export const eliminarMunicipio = async (req, res) => {
  const { cod_municipio } = req.params;

  try {
    // Obtener la conexión del pool
    const pool = await conectarDB();

    // Consulta SQL para eliminar un municipio
    const [result] = await pool.query(`
      DELETE FROM tbl_municipio
      WHERE cod_municipio = ?
    `, [cod_municipio]);

    // Verificar si se eliminó el municipio
    if (result.affectedRows > 0) {
      res.status(200).json({ message: 'Municipio eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'No se encontró el municipio' });
    }
  } catch (error) {
    console.error('Error al eliminar el municipio:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Controlador para obtener municipios por departamento
export const obtenerMunicipiosPorDepartamento = async (req, res) => {
  const { cod_departamento } = req.params;
  
  try {
    const pool = await conectarDB();
    const [municipios] = await pool.query(`
      SELECT cod_municipio, nombre_municipio 
      FROM tbl_municipio 
      WHERE cod_departamento = ?
      ORDER BY nombre_municipio ASC
    `, [cod_departamento]);

    res.json(municipios);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      message: 'Error al obtener los municipios',
      error: error.message 
    });
  }
};