import conectarDB from '../../../config/db.js';
const pool = await conectarDB();

// Controlador para obtener todos los géneros de persona
export const obtenerTodoGeneroPersona = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL P_Get_GeneroPersona()');

        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron géneros de persona' });
        }
    } catch (error) {
        console.error('Error al obtener la lista de géneros de persona:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para crear un género de persona
export const crearGeneroPersona = async (req, res) => {
    const { Tipo_genero, estado } = req.body;

    try {
        await pool.query('CALL P_Post_GeneroPersona(?, ?)', [Tipo_genero, estado]);

        res.status(201).json({ mensaje: 'Género de persona creado exitosamente' });
    } catch (error) {
        console.error('Error al crear género de persona:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para actualizar un género de persona
export const actualizarGeneroPersona = async (req, res) => {
    const { Cod_genero } = req.params;
    const { Tipo_genero, estado } = req.body;

    try {
        await pool.query('CALL P_Put_GeneroPersona(?, ?, ?)', [
            Cod_genero,
            Tipo_genero,
            estado
        ]);

        res.status(200).json({ mensaje: 'Género de persona actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar género de persona:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para actualizar el estado de un género de persona
export const actualizarEstadoGeneroPersona = async (req, res) => {
    const { Cod_genero, estado } = req.body;

    // Validar parámetros
    if (!Cod_genero || estado === undefined) {
        return res.status(400).json({ mensaje: 'Faltan parámetros' });
    }

    try {
        // Llamar al procedimiento almacenado
        const [results] = await pool.query('CALL P_Put_EstadoGeneroPersona(?, ?)', [Cod_genero, estado]);

        // Obtener el mensaje devuelto por el procedimiento
        const mensaje = results[0][0].mensaje;

        console.log(`Estado actualizado para género ${Cod_genero}: ${estado}`); // Debug en consola
        res.json({ mensaje, Cod_genero, estado }); // Respuesta al frontend
    } catch (error) {
        console.error('Error al ejecutar el procedimiento almacenado:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

// Controlador para eliminar un género de persona
export const eliminarGeneroPersona = async (req, res) => {
    const { Cod_genero } = req.params;

    if (!Cod_genero) {
        return res.status(400).json({ Mensaje: 'cod_genero es requerido' });
    }

    try {
        await pool.query('CALL P_Delete_GeneroPersona(?)', [Cod_genero]);
        res.status(200).json({ Mensaje: 'Género de persona eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar género de persona:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
