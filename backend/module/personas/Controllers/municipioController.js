import conectarDB from '../../../config/db.js';
const pool = await conectarDB();

// Controlador para obtener todos los municipios
export const obtenerTodoMunicipio = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL P_Get_Municipio()');

        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron municipios' });
        }
    } catch (error) {
        console.error('Error al obtener la lista de municipios:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para crear un municipio
export const crearMunicipio = async (req, res) => {
    const { nombre_municipio, cod_departamento, estado } = req.body;

    try {
        await pool.query('CALL P_Post_Municipio(?, ?, ?)', [nombre_municipio, cod_departamento, estado]);

        res.status(201).json({ mensaje: 'Municipio creado exitosamente' });
    } catch (error) {
        console.error('Error al crear municipio:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para actualizar un municipio
export const actualizarMunicipio = async (req, res) => {
    const { cod_municipio } = req.params;
    const { nombre_municipio, cod_departamento, estado } = req.body;

    try {
        await pool.query('CALL P_Put_Municipio(?, ?, ?, ?)', [
            cod_municipio,
            nombre_municipio,
            cod_departamento,
            estado
        ]);

        res.status(200).json({ mensaje: 'Municipio actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar municipio:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para actualizar el estado de un municipio
export const actualizarEstadoMunicipio = async (req, res) => {
    const { cod_municipio, estado } = req.body;

    // Validar parámetros
    if (!cod_municipio || estado === undefined) {
        return res.status(400).json({ mensaje: 'Faltan parámetros' });
    }

    try {
        // Llamar al procedimiento almacenado
        const [results] = await pool.query('CALL P_Put_EstadoMunicipio(?, ?)', [cod_municipio, estado]);

        // Obtener el mensaje devuelto por el procedimiento
        const mensaje = results[0][0].mensaje;

        console.log(`Estado actualizado para municipio ${cod_municipio}: ${estado}`); // Debug en consola
        res.json({ mensaje, cod_municipio, estado }); // Respuesta al frontend
    } catch (error) {
        console.error('Error al ejecutar el procedimiento almacenado:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

// Controlador para eliminar un municipio
export const eliminarMunicipio = async (req, res) => {
    const { cod_municipio } = req.params;

    if (!cod_municipio) {
        return res.status(400).json({ Mensaje: 'cod_municipio es requerido' });
    }

    try {
        await pool.query('CALL P_Delete_Municipio(?)', [cod_municipio]);
        res.status(200).json({ Mensaje: 'Municipio eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar municipio:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
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
