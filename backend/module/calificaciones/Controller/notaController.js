import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


// Obtener todas las notas
export const obtenerNotas = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL get_all_notas()');
        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron notas' });
        }
    } catch (error) {
        console.error('Error al obtener las notas:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Crear una nueva nota
export const crearNota = async (req, res) => {
    const { Nota, Observacion, Cod_parcial, Cod_estado, Cod_seccion_asignatura, Cod_seccion_persona } = req.body;

    try {
        await pool.query('CALL insert_nota(?,?,?,?,?,?)', [
            Nota,
            Observacion,
            Cod_parcial,
            Cod_estado,
            Cod_seccion_asignatura,
            Cod_seccion_persona
        ]);
        res.status(201).json({ Mensaje: 'Nota agregada exitosamente' });
    } catch (error) {
        console.error('Error al agregar nota:', error);
        if (error.code === 'ER_SIGNAL_EXCEPTION') {
            res.status(400).json({ Mensaje: error.sqlMessage });
        } else {
            res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
        }
    }
};

// Actualizar una nota
export const actualizarNota = async (req, res) => {
    const { Cod_nota, Nota, Observacion, Cod_parcial, Cod_estado, Cod_seccion_asignatura, Cod_seccion_persona } = req.body;

    try {
        await pool.query('CALL update_nota(?,?,?,?,?,?,?)', [
            Cod_nota,
            Nota,
            Observacion,
            Cod_parcial,
            Cod_estado,
            Cod_seccion_asignatura,
            Cod_seccion_persona
        ]);
        res.status(200).json({ Mensaje: 'Nota actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar nota:', error);
        if (error.code === 'ER_SIGNAL_EXCEPTION') {
            res.status(400).json({ Mensaje: error.sqlMessage });
        } else {
            res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
        }
    }
};

// Eliminar una nota
export const eliminarNota = async (req, res) => {
    const { Cod_nota } = req.body;

    if (!Cod_nota) {
        return res.status(400).json({ Mensaje: 'Cod_nota es requerido' });
    }

    try {
        await pool.query('CALL delete_nota(?)', [Cod_nota]);
        res.status(200).json({ Mensaje: 'Nota eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar nota:', error);
        if (error.code === 'ER_SIGNAL_EXCEPTION') {
            res.status(400).json({ Mensaje: error.sqlMessage });
        } else {
            res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
        }
    }
};
