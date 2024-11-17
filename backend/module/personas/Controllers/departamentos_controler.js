import conectarDB from '../../../config/db.js';


// Controlador para obtener los departamentos y municipios
export const obtenerDepartamentosYMunicipios = async (req, res) => {
    try {
        // Obtener la conexión del pool
        const pool = await conectarDB();

        // Consulta SQL para obtener departamentos y municipios relacionados
        const [rows] = await pool.query(`
            SELECT d.cod_departamento, d.nombre_departamento, m.cod_municipio, m.nombre_municipio
            FROM tbl_departamento d
            LEFT JOIN tbl_municipio m ON d.cod_departamento = m.cod_departamento
        `);

        // Verificar si hay resultados
        if (rows.length > 0) {
            res.status(200).json(rows);  // Retornar los resultados
        } else {
            res.status(404).json({ message: 'No se encontraron departamentos o municipios' });
        }
    } catch (error) {
        console.error('Error al obtener departamentos y municipios:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// Controlador para obtener los departamentos y municipios
export const departamento = async (req, res) => {
    try {
        // Obtener la conexión del pool
        const pool = await conectarDB();

        // Consulta SQL para obtener departamentos y municipios relacionados
        const [rows] = await pool.query(`
            SELECT cod_departamento, nombre_departamento FROM tbl_departamento 
        `);

        // Verificar si hay resultados
        if (rows.length > 0) {
            res.status(200).json(rows);  // Retornar los resultados
        } else {
            res.status(404).json({ message: 'No se encontraron departamentos' });
        }
    } catch (error) {
        console.error('Error al obtener departamentos', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// Controlador para crear un departamento
export const crearDepartamento = async (req, res) => {
    const { nombre_departamento } = req.body;
  
    try {
      // Obtener la conexión del pool
      const pool = await conectarDB();
  
      // Consulta SQL para crear un nuevo departamento
      const [result] = await pool.query(`
        INSERT INTO tbl_departamento (nombre_departamento)
        VALUES (?)
      `, [nombre_departamento]);
  
      // Verificar si se creó el departamento
      if (result.affectedRows > 0) {
        res.status(201).json({ message: 'Departamento creado exitosamente', cod_departamento: result.insertId });
      } else {
        res.status(400).json({ message: 'Error al crear el departamento' });
      }
    } catch (error) {
      console.error('Error al crear el departamento:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  };
  
  // Controlador para editar un departamento
  export const editarDepartamento = async (req, res) => {
    const { cod_departamento } = req.params;
    const { nombre_departamento } = req.body;
  
    try {
      // Obtener la conexión del pool
      const pool = await conectarDB();
  
      // Consulta SQL para actualizar un departamento
      const [result] = await pool.query(`
        UPDATE tbl_departamento
        SET nombre_departamento = ?
        WHERE cod_departamento = ?
      `, [nombre_departamento, cod_departamento]);
  
      // Verificar si se actualizó el departamento
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Departamento actualizado exitosamente' });
      } else {
        res.status(404).json({ message: 'No se encontró el departamento' });
      }
    } catch (error) {
      console.error('Error al editar el departamento:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  };
  
  // Controlador para eliminar un departamento
  export const eliminarDepartamento = async (req, res) => {
    const { cod_departamento } = req.params;
  
    try {
      // Obtener la conexión del pool
      const pool = await conectarDB();
  
      // Consulta SQL para eliminar un departamento
      const [result] = await pool.query(`
        DELETE FROM tbl_departamento
        WHERE cod_departamento = ?
      `, [cod_departamento]);
  
      // Verificar si se eliminó el departamento
      if (result.affectedRows > 0) {
        res.status(200).json({ message: 'Departamento eliminado correctamente' });
      } else {
        res.status(404).json({ message: 'No se encontró el departamento' });
      }
    } catch (error) {
      console.error('Error al eliminar el departamento:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  };

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