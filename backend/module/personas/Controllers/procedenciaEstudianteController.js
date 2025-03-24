import conectarDB from '../../../config/db.js';
const pool = await conectarDB();

// Obtener todas las procedencias de estudiantes
export const obtenerTodoProcedenciaEstudiante = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL P_Get_ProcedenciaEstudiante()');
        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ mensaje: 'No se encontraron registros' });
        }
    } catch (error) {
        console.error('Error al obtener las procedencias:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Crear una nueva procedencia de estudiante
export const crearProcedenciaEstudiante = async (req, res) => {
    const { cod_persona, nombre_instituto, descripcion, año_desde, año_hasta } = req.body;
    try {
        await pool.query('CALL P_Post_ProcedenciaEstudiante(?, ?, ?, ?, ?)', [
            cod_persona, nombre_instituto, descripcion, año_desde, año_hasta
        ]);
        res.status(201).json({ mensaje: 'Procedencia de estudiante creada exitosamente' });
    } catch (error) {
        console.error('Error al crear procedencia:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Actualizar una procedencia de estudiante
export const actualizarProcedenciaEstudiante = async (req, res) => {
    const { Cod_procedencia_estudiante } = req.params;
    const { cod_persona, nombre_instituto, descripcion, año_desde, año_hasta } = req.body;
    try {
        await pool.query('CALL P_Put_ProcedenciaEstudiante(?, ?, ?, ?, ?, ?)', [
            Cod_procedencia_estudiante, cod_persona, nombre_instituto, descripcion, año_desde, año_hasta
        ]);
        res.status(200).json({ mensaje: 'Procedencia de estudiante actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar procedencia:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Eliminar una procedencia de estudiante
export const eliminarProcedenciaEstudiante = async (req, res) => {
    const { Cod_procedencia_estudiante } = req.params;
    if (!Cod_procedencia_estudiante) {
        return res.status(400).json({ mensaje: 'Cod_procedencia_estudiante es requerido' });
    }
    try {
        await pool.query('CALL P_Delete_ProcedenciaEstudiante(?)', [Cod_procedencia_estudiante]);
        res.status(200).json({ mensaje: 'Procedencia de estudiante eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar procedencia:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};
