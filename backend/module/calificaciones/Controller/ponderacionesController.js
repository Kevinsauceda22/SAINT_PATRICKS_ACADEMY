import conectarDB from '../../../config/db.js';
const pool = await conectarDB();

// Obtener todas las ponderaciones
export const obtenerPonderaciones = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL get_all_ponderacion()');
        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron ponderaciones' });
        }
    } catch (error) {
        console.error('Error al obtener las ponderaciones:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Crear una nueva ponderación
export const crearPonderacion = async (req, res) => {
    const { Descripcion_ponderacion } = req.body;

    try {
        await pool.query('CALL insert_ponderacion(?)', [Descripcion_ponderacion]);
        res.status(201).json({ Mensaje: 'La ponderación fue creada exitosamente' });
    } catch (error) {
        console.error('Error al crear la ponderación:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Actualizar una ponderación
export const actualizarPonderacion = async (req, res) => {
    const { Cod_ponderacion, Descripcion_ponderacion } = req.body;

   // console.log('Datos recibidos para actualizar la ponderación:', req.body); 

    try {
        await pool.query('CALL update_ponderacion(?, ?)', [Cod_ponderacion, Descripcion_ponderacion]);
        res.status(200).json({ Mensaje: 'La ponderación fue actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar la ponderación:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Eliminar una ponderación
export const eliminarPonderacion = async (req, res) => {
    const { Cod_ponderacion } = req.body; 

    if (!Cod_ponderacion) {
        return res.status(400).json({ Mensaje: 'Cod_ponderacion es requerido' });
    }

    try {
        await pool.query('CALL delete_ponderacion(?)', [Cod_ponderacion]);
        res.status(200).json({ Mensaje: 'La ponderación fue eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar la ponderación:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
