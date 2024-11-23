import conectarDB from '../../../config/db.js';

// Controlador para obtener los municipios
export const obtenerMunicipios = async (req, res) => {
  try {
    const pool = await conectarDB();
    
    // Ejecutar el procedimiento almacenado P_Get_Municipios
    const [rows] = await pool.query('CALL P_Get_Municipios()');

    if (rows.length > 0) {
      res.status(200).json(rows[0]); // Los resultados se encuentran en rows[0]
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
    const pool = await conectarDB();

    // Ejecutar el procedimiento almacenado P_Post_Municipios
    const [result] = await pool.query('CALL P_Post_Municipios(?, ?)', [nombre_municipio, cod_departamento]);

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
    const pool = await conectarDB();

    // Ejecutar el procedimiento almacenado P_Put_Municipios
    const [result] = await pool.query('CALL P_Put_Municipios(?, ?, ?)', [cod_municipio, nombre_municipio, cod_departamento]);

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
    const pool = await conectarDB();

    // Ejecutar el procedimiento almacenado P_Delete_Municipios
    const [result] = await pool.query('CALL P_Delete_Municipios(?)', [cod_municipio]);

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

    // Ejecutar el procedimiento almacenado P_Get_MunicipiosPorDepartamento
    const [municipios] = await pool.query('CALL P_Get_MunicipiosPorDepartamento(?)', [cod_departamento]);

    if (municipios.length > 0) {
      res.status(200).json(municipios);
    } else {
      res.status(404).json({ message: 'No se encontraron municipios para este departamento' });
    }
  } catch (error) {
    console.error('Error al obtener los municipios por departamento:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};
