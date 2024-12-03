import conectarDB from '../../../config/db.js';

// Controlador para crear un género de persona
export const crearGeneroPersona = async (req, res) => {
    const { Tipo_genero } = req.body;
    const pool = await conectarDB();
  
    try {
      // Ejecuta la consulta de inserción
      const [result] = await pool.query('CALL P_Insert_Genero_Persona(?)', [Tipo_genero]);
  
      // Obtiene el Cod_genero del nuevo registro (ID autogenerado)
      const newCodGenero = result.insertId;
  
      // Devuelve una respuesta de éxito incluyendo el Cod_genero recién creado
      res.status(201).json({ Cod_genero: newCodGenero, Mensaje: 'Género de persona creado exitosamente' });
    } catch (error) {
      console.error('Error al crear el género de persona:', error);
      res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
  };

// Controlador para obtener uno o todos los géneros de persona
export const obtenerGeneroPersona = async (req, res) => {
    const { Cod_genero } = req.params;
    const pool = await conectarDB();

    try {
        let query = 'CALL P_Get_Genero_Persona()';
        const [results] = await pool.query(query);

        let generoPersona = results[0];

        // Determinamos la consulta en función de si hay un Cod_genero proporcionado
        if (Cod_genero) {
            generoPersona = generoPersona.find(item => item.Cod_genero === parseInt(Cod_genero));
            if (!generoPersona) {
                return res.status(404).json({ 
                    Mensaje: 'Genero no encontrado',
                    data: []
                });
            }
        }
        res.status(200).json(Cod_genero ? generoPersona : results[0]);
    } catch (error) {
        console.error('Error al obtener los generos:', error);
        res.status(500).json({ 
            Mensaje: 'Error en el servidor', 
            error: error.message 
        });
    }
};
// Controlador para actualizar un género de persona
export const actualizarGeneroPersona = async (req, res) => {
    const { Tipo_genero } = req.body;
    const { Cod_genero } = req.params;
    const pool = await conectarDB();

    try {
        // Verificar si el género existe antes de actualizar
        const [existingGenero] = await pool.query('CALL P_Get_Genero_Persona_Por_Codigo(?)', [Cod_genero]);
        if (!existingGenero[0]) {
            return res.status(404).json({ Mensaje: 'Género de persona no encontrado' });
        }

        // Si el género existe, procedemos a actualizarlo
        await pool.query('CALL P_Update_Genero_Persona(?, ?)', [Tipo_genero, Cod_genero]);

        res.status(200).json({ Mensaje: 'Género de persona actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el género de persona:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para eliminar un género de persona
export const eliminarGeneroPersona = async (req, res) => {
    const { Cod_genero } = req.params;
    const pool = await conectarDB();

    try {
        // Verificar si el género existe antes de eliminar
        const [existingGenero] = await pool.query('CALL P_Get_Genero_Persona_Por_Codigo(?)', [Cod_genero]);
        if (!existingGenero[0]) {
            return res.status(404).json({ Mensaje: 'Género de persona no encontrado' });
        }

        // Si el género existe, procedemos a eliminarlo
        await pool.query('CALL P_Delete_Genero_Persona(?)', [Cod_genero]);

        res.status(200).json({ Mensaje: 'Género de persona eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el género de persona:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};