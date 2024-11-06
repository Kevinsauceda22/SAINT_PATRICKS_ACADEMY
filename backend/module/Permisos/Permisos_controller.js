import conectarDB from '../../config/db.js';

// Obtener todos los permisos
export const obtenerPermisos = async (req, res) => {
  try {
    const pool = await conectarDB();
    const [rows] = await pool.query('SELECT * FROM tbl_permisos');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los permisos', error });
  }
};

// Obtener un permiso por su ID
export const obtenerPermisoPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await conectarDB();
    const [rows] = await pool.query('SELECT * FROM tbl_permisos WHERE Cod_Permiso = ?', [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Permiso no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el permiso', error });
  }
};

// Crear un nuevo permiso
export const crearPermiso = async (req, res) => {
  const {
    Cod_Objeto,
    Cod_Rol,
    Permiso_Modulo,
    Permiso_Insercion,
    Permiso_Eliminacion,
    Permiso_Actualizacion,
    Permiso_Consultar
  } = req.body;

  try {
    const pool = await conectarDB();
    const [result] = await pool.query(
      `INSERT INTO tbl_permisos 
      (Cod_Objeto, Cod_Rol, Permiso_Modulo, Permiso_Insercion, Permiso_Eliminacion, Permiso_Actualizacion, Permiso_Consultar)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [Cod_Objeto, Cod_Rol, Permiso_Modulo, Permiso_Insercion, Permiso_Eliminacion, Permiso_Actualizacion, Permiso_Consultar]
    );
    res.status(201).json({ message: 'Permiso creado', Cod_Permiso: result.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el permiso', error });
  }
};

// Actualizar un permiso
export const actualizarPermiso = async (req, res) => {
  const { id } = req.params;
  console.log('ID recibido:', id); // Agrega esto para verificar el ID recibido

  const {
    Cod_Objeto,
    Cod_Rol,
    Permiso_Modulo,
    Permiso_Insercion,
    Permiso_Eliminacion,
    Permiso_Actualizacion,
    Permiso_Consultar
  } = req.body;

  try {
    const pool = await conectarDB();
    const [result] = await pool.query(
        `UPDATE tbl_permisos 
         SET Cod_Objeto = ?, Cod_Rol = ?, Permiso_Modulo = ?, Permiso_Insercion = ?, Permiso_Eliminacion = ?, Permiso_Actualizacion = ?, Permiso_Consultar = ?
         WHERE Cod_Permiso = ?`,
        [Cod_Objeto, Cod_Rol, Permiso_Modulo, Permiso_Insercion, Permiso_Eliminacion, Permiso_Actualizacion, Permiso_Consultar, id]
    );
    

    if (result.affectedRows > 0) {
      res.json({ message: 'Permiso actualizado' });
    } else {
      res.status(404).json({ message: 'Permiso no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el permiso', error });
  }
};

// Eliminar un permiso
export const eliminarPermiso = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await conectarDB();
    const [result] = await pool.query('DELETE FROM tbl_permisos WHERE Cod_Permiso = ?', [id]);
    
    if (result.affectedRows > 0) {
      res.json({ message: 'Permiso eliminado' });
    } else {
      res.status(404).json({ message: 'Permiso no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el permiso', error });
  }
};

// Permisos_controller.js

// Nueva función para cambiar el estado de los permisos
export const cambiarEstadoPermiso = async (req, res) => {
    const { id } = req.params;
    const {
      Cod_Objeto,
      Cod_Rol,
      Permiso_Modulo,
      Permiso_Insercion,
      Permiso_Eliminacion,
      Permiso_Actualizacion,
      Permiso_Consultar
    } = req.body;
  
    try {
      const pool = await conectarDB();
  
      // Validar parámetros requeridos
      if (!Cod_Objeto || !Cod_Rol) {
        return res.status(400).json({ message: 'Faltan parámetros requeridos.' });
      }
  
      // Primero verificamos si existe el permiso
      const [existingPermission] = await pool.query(
        'SELECT * FROM tbl_permisos WHERE Cod_Rol = ? AND Cod_Objeto = ?',
        [Cod_Rol, Cod_Objeto]
      );
  
      let queryResult;
  
      if (existingPermission.length === 0) {
        // Si no existe, creamos un nuevo registro
        [queryResult] = await pool.query(
          `INSERT INTO tbl_permisos 
          (Cod_Objeto, Cod_Rol, Permiso_Modulo, Permiso_Insercion, Permiso_Eliminacion, Permiso_Actualizacion, Permiso_Consultar)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [Cod_Objeto, Cod_Rol, Permiso_Modulo, Permiso_Insercion, Permiso_Eliminacion, Permiso_Actualizacion, Permiso_Consultar]
        );
      } else {
        // Si existe, actualizamos el registro
        [queryResult] = await pool.query(
          `UPDATE tbl_permisos 
          SET Permiso_Modulo = ?,
              Permiso_Insercion = ?,
              Permiso_Eliminacion = ?,
              Permiso_Actualizacion = ?,
              Permiso_Consultar = ?
          WHERE Cod_Rol = ? AND Cod_Objeto = ?`,
          [
            Permiso_Modulo,
            Permiso_Insercion,
            Permiso_Eliminacion,
            Permiso_Actualizacion,
            Permiso_Consultar,
            Cod_Rol,
            Cod_Objeto
          ]
        );
      }
  
      // Verificar si se realizó la operación correctamente
      if (queryResult.affectedRows > 0) {
        // Obtener los permisos actualizados
        const [updatedPermissions] = await pool.query(
          'SELECT * FROM tbl_permisos WHERE Cod_Rol = ? AND Cod_Objeto = ?',
          [Cod_Rol, Cod_Objeto]
        );
  
        res.json({
          message: existingPermission.length === 0 ? 'Permiso creado' : 'Permiso actualizado',
          permisos: updatedPermissions[0]
        });
      } else {
        res.status(404).json({ message: 'No se pudo actualizar el permiso' });
      }
    } catch (error) {
      console.error('Error en cambiarEstadoPermiso:', error);
      res.status(500).json({
        message: 'Error al modificar el permiso',
        error: error.message
      });
    }
};

// Asegúrate de exportar esta función para que esté disponible en otros módulos
