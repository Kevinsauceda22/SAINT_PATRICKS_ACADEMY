import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


// Obtener todas las especialidades
export const obtenerEspecialidades = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL get_especialidades()');

        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron especialidades' });
        }
    } catch (error) {
        console.error('Error al obtener las especialidades:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Crear una nueva especialidad
export const crearEspecialidad = async (req, res) => {
    const { Nombre_especialidad } = req.body;

    try {
        await pool.query('CALL insert_especialidad(?)', [Nombre_especialidad]);
        res.status(201).json({ Mensaje: 'Especialidad creada exitosamente' });
    } catch (error) {
        console.error('Error al crear la especialidad:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Actualizar una especialidad
export const actualizarEspecialidad = async (req, res) => {
    const { Cod_Especialidad, Nombre_especialidad } = req.body;

    try {
        await pool.query('CALL update_especialidad(?, ?)', [
            Cod_Especialidad,
            Nombre_especialidad
        ]);
        res.status(200).json({ Mensaje: 'Especialidad actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar la especialidad:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Eliminar una especialidad
export const eliminarEspecialidad = async (req, res) => {
    const { Cod_Especialidad } = req.body;

    if (!Cod_Especialidad) {
        return res.status(400).json({ Mensaje: 'Cod_Especialidad es requerido' });
    }

    try {
        await pool.query('CALL delete_especialidad(?)', [Cod_Especialidad]);
        res.status(200).json({ Mensaje: 'Especialidad eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar la especialidad:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
