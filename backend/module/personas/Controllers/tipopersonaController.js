import conectarDB from '../../../config/db.js';
const pool = await conectarDB();

// Controlador para obtener todos los tipos de persona
export const obtenerTodoTipoPersona = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL P_Get_TipoPersona()');

        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron tipos de persona' });
        }
    } catch (error) {
        console.error('Error al obtener la lista de tipos de persona:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para crear un tipo de persona
export const crearTipoPersona = async (req, res) => {
    const { tipo_persona, estado } = req.body;

    try {
        // Llamada al procedimiento almacenado para crear el tipo de persona
        await pool.query('CALL P_Post_TipoPersona(?, ?)', [tipo_persona, estado]);

        res.status(201).json({ mensaje: 'Tipo de persona creado exitosamente' });
    } catch (error) {
        console.error('Error al crear tipo de persona:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};


// Controlador para actualizar un tipo de persona
export const actualizarTipoPersona = async (req, res) => {
    const { Cod_tipo_persona } = req.params;
    const { Tipo_persona, estado } = req.body;


    try {
        await pool.query('CALL P_Put_TipoPersona(?, ?, ?)', [
            Cod_tipo_persona,
            Tipo_persona,
            estado
        ]);
        res.status(200).json({ mensaje: 'Tipo de persona actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar tipo de persona:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para actualizar el estado de un tipo de persona
export const actualizarEstadoTipoPersona = async (req, res) => {
    const { cod_tipo_persona, estado } = req.body;

    // Validar parámetros
    if (!cod_tipo_persona || estado === undefined) {
        return res.status(400).json({ mensaje: 'Faltan parámetros' });
    }

    try {
        // Llamar al procedimiento almacenado
        const [results] = await pool.query('CALL P_Put_EstadoTipoPersona(?, ?)', [cod_tipo_persona, estado]);

        // Obtener el mensaje devuelto por el procedimiento
        const mensaje = results[0][0].mensaje;

        console.log(`Estado actualizado para tipo de persona ${cod_tipo_persona}: ${estado}`); // Debug en consola
        res.json({ mensaje, cod_tipo_persona, estado }); // Respuesta al frontend
    } catch (error) {
        console.error('Error al ejecutar el procedimiento almacenado:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

// Controlador para eliminar un tipo de persona
export const eliminarTipoPersona = async (req, res) => {
    const { Cod_tipo_persona } = req.params;

    if (!Cod_tipo_persona) {
        return res.status(400).json({ Mensaje: 'Cod_tipo_persona es requerido' });
    }

    try {
        await pool.query('CALL P_Delete_TipoPersona(?)', [Cod_tipo_persona]);
        res.status(200).json({ Mensaje: 'Tipo de persona eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar tipo de persona:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
