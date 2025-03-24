import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


// Controlador para obtener todas las relaciones
export const obtenerTodoTipoRelacion = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL P_Get_TipoRelacion()');

        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron tipos de relación' });
        }
    } catch (error) {
        console.error('Error al obtener la lista de tipos de relación:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para crear un tipo de relación
export const crearTipoRelacion = async (req, res) => {
    const { tipo_relacion, estado } = req.body;

    try {
        await pool.query('CALL P_Post_TipoRelacion(?, ?)', [tipo_relacion, estado]);

        res.status(201).json({ mensaje: 'Tipo de relación creada exitosamente' });
    } catch (error) {
        console.error('Error al crear tipo de relación:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para actualizar un tipo de relación
export const actualizarTipoRelacion = async (req, res) => {
    const { Cod_tipo_relacion } = req.params;
    const { tipo_relacion, estado } = req.body;

    try {
        await pool.query('CALL P_Put_TipoRelacion(?, ?, ?)', [
            Cod_tipo_relacion,
            tipo_relacion,
            estado
        ]);

        res.status(200).json({ mensaje: 'Tipo de relación actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

export const actualizarEstadoTipoRelacion = async (req, res) => {
    const { cod_tipo_relacion, estado } = req.body;

    // Validar parámetros
    if (!cod_tipo_relacion || estado === undefined) {
        return res.status(400).json({ mensaje: 'Faltan parámetros' });
    }

    try {
        // Llamar al procedimiento almacenado
        const [results] = await pool.query('CALL P_Put_EstadoTipoRelación(?, ?)', [cod_tipo_relacion, estado]);

        // Obtener el mensaje devuelto por el procedimiento
        const mensaje = results[0][0].mensaje;

        console.log(`Estado actualizado para tipo de relación ${cod_tipo_relacion}: ${estado}`); // Debug en consola
        res.json({ mensaje, cod_tipo_relacion, estado }); // Respuesta al frontend
    } catch (error) {
        console.error('Error al ejecutar el procedimiento almacenado:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};


// Controlador para eliminar un tipo de relación
export const eliminarTipoRelacion = async (req, res) => {
    const { Cod_tipo_relacion } = req.params;

    if (!Cod_tipo_relacion) {
        return res.status(400).json({ Mensaje: 'Cod_tipo_relacion es requerido' });
    }

    try {
        await pool.query('CALL P_Delete_TipoRelacion(?)', [Cod_tipo_relacion]);
        res.status(200).json({ Mensaje: 'Tipo de relación eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar tipo de relación:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
