import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


// Obtener todos los historiales académicos
export const obtenerHistoriales = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL get_all_historiales_academicos()');
        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron historiales académicos' });
        }
    } catch (error) {
        console.error('Error al obtener los historiales académicos:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Crear un nuevo historial académico
export const crearHistorial = async (req, res) => {
    const { Cod_estado, Grado, Año_Academico, Promedio_Anual, Instituto } = req.body;

    try {
        await pool.query('CALL insert_historial_academico(?, ?, ?, ?, ?)', [
            Cod_estado,
            Grado,
            Año_Academico,
            Promedio_Anual,
            Instituto
        ]);
        res.status(201).json({ Mensaje: 'Historial académico agregado exitosamente' });
    } catch (error) {
        console.error('Error al agregar historial académico:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Actualizar un historial académico
export const actualizarHistorial = async (req, res) => {
    const { Cod_historial_academico, Cod_estado, Grado, Año_Academico, Promedio_Anual, Instituto } = req.body;

    try {
        await pool.query('CALL update_historial_academico(?,?,?,?,?,?)', [
            Cod_historial_academico,
            Cod_estado,
            Grado,
            Año_Academico,
            Promedio_Anual,
            Instituto
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

    try {
        await pool.query('CALL delete_historial_academico(?)', [Cod_historial_academico]);
        res.status(200).json({ Mensaje: 'Historial eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el historial:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
