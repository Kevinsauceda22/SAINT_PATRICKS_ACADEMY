import conectarDB from '../../../config/db.js';
const pool = conectarDB(); // Inicializamos la conexión al pool

// Obtener historiales académicos por Cod_persona
export const obtenerHistorialesPorPersona = async (req, res) => {
    const { Cod_persona } = req.params;

    try {
        if (!Cod_persona) {
            return res.status(400).json({ Mensaje: 'El código de persona es obligatorio' });
        }

        const [rows] = await pool.query('CALL GET_HISTORIAL_POR_PERSONA(?)', [Cod_persona]);

        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron historiales académicos para esta persona' });
        }
    } catch (error) {
        console.error('Error al obtener los historiales académicos por persona:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Agregar un nuevo historial
export const crearHistorial = async (req, res) => {
    const { Cod_estado, Estudiante, Grado, Año_Academico, Promedio_Anual, Instituto } = req.body;

    if (!Cod_estado || !Estudiante || !Grado || !Año_Academico || !Promedio_Anual || !Instituto) {
        return res.status(400).json({ Mensaje: 'Todos los campos son obligatorios' });
    }

    try {
        await pool.query('CALL insert_historial_academico(?, ?, ?, ?, ?, ?)', [
            Cod_estado,
            Estudiante,
            Grado,
            Año_Academico,
            Promedio_Anual,
            Instituto,
        ]);
        res.status(201).json({ Mensaje: 'Historial académico agregado exitosamente' });
    } catch (error) {
        console.error('Error al agregar historial académico:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Actualizar un historial académico
export const actualizarHistorial = async (req, res) => {
    const { Cod_historial_academico, Cod_estado, Estudiante, Grado, Año_Academico, Promedio_Anual, Instituto } = req.body;

    if (!Cod_historial_academico || !Cod_estado || !Estudiante || !Grado || !Año_Academico || !Promedio_Anual || !Instituto) {
        return res.status(400).json({ Mensaje: 'Todos los campos son obligatorios' });
    }

    try {
        await pool.query('CALL update_historial_academico(?, ?, ?, ?, ?, ?, ?)', [
            Cod_historial_academico,
            Cod_estado,
            Estudiante,
            Grado,
            Año_Academico,
            Promedio_Anual,
            Instituto,
        ]);
        res.status(200).json({ Mensaje: 'Historial académico actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar historial académico:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Eliminar un historial académico
export const eliminarHistorial = async (req, res) => {
    const { Cod_historial_academico } = req.body;

    if (!Cod_historial_academico) {
        return res.status(400).json({ Mensaje: 'El código del historial es obligatorio' });
    }

    try {
        await pool.query('CALL DELETE_HISTORIAL(?)', [Cod_historial_academico]);
        res.status(200).json({ Mensaje: 'Historial eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el historial:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
