import conectarDB from '../../../config/db.js';
const pool = await conectarDB();

// Controlador para obtener todas las nacionalidades
export const obtenerTodoNacionalidad = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL P_Get_Nacionalidad()');

        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron nacionalidades' });
        }
    } catch (error) {
        console.error('Error al obtener la lista de nacionalidades:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para crear una nacionalidad
export const crearNacionalidad = async (req, res) => {
    const { Id_nacionalidad, pais_nacionalidad, pais, estado } = req.body;

    try {
        await pool.query('CALL P_Post_Nacionalidad(?, ?, ?, ?)', [Id_nacionalidad, pais_nacionalidad, pais, estado]);

        res.status(201).json({ mensaje: 'Nacionalidad creada exitosamente' });
    } catch (error) {
        console.error('Error al crear nacionalidad:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para actualizar una nacionalidad
export const actualizarNacionalidad = async (req, res) => {
    const { Cod_nacionalidad } = req.params;
    const { Id_nacionalidad, pais_nacionalidad, pais, estado } = req.body;

    try {
        await pool.query('CALL P_Put_Nacionalidad(?, ?, ?, ?, ?)', [
            Cod_nacionalidad,
            Id_nacionalidad,
            pais_nacionalidad,
            pais,
            estado
        ]);

        res.status(200).json({ mensaje: 'Nacionalidad actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar nacionalidad:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para actualizar el estado de una nacionalidad
export const actualizarEstadoNacionalidad = async (req, res) => {
    const { Cod_nacionalidad, estado } = req.body;

    // Validar parámetros
    if (!Cod_nacionalidad || estado === undefined) {
        return res.status(400).json({ mensaje: 'Faltan parámetros' });
    }

    try {
        // Llamar al procedimiento almacenado
        const [results] = await pool.query('CALL P_Put_EstadoNacionalidad(?, ?)', [Cod_nacionalidad, estado]);

        // Obtener el mensaje devuelto por el procedimiento
        const mensaje = results[0][0].mensaje;

        console.log(`Estado actualizado para nacionalidad ${Cod_nacionalidad}: ${estado}`); // Debug en consola
        res.json({ mensaje, Cod_nacionalidad, estado }); // Respuesta al frontend
    } catch (error) {
        console.error('Error al ejecutar el procedimiento almacenado:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

// Controlador para eliminar una nacionalidad
export const eliminarNacionalidad = async (req, res) => {
    const { Cod_nacionalidad } = req.params;

    if (!Cod_nacionalidad) {
        return res.status(400).json({ Mensaje: 'Cod_nacionalidad es requerido' });
    }

    try {
        await pool.query('CALL P_Delete_Nacionalidad(?)', [Cod_nacionalidad]);
        res.status(200).json({ Mensaje: 'Nacionalidad eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar nacionalidad:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
