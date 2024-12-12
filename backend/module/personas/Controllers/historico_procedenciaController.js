import conectarDB from '../../../config/db.js';
const pool = await conectarDB();

// Controlador para obtener el historial de procedencia
export const obtenerHistoricoProcedencia = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL P_Get_HistoricoProcedencia()');

        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'No se encontraron registros de historico de procedencia' });
        }
    } catch (error) {
        console.error('Error al obtener el historico de procedencia:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};


// Controlador para crear un registro en el historico de procedencia
export const crearHistoricoProcedencia = async (req, res) => {
    const {
        cod_persona,
        instituto,
        lugar_procedencia,
        anio_ingreso
    } = req.body;

    try {
        await pool.query('CALL P_Post_HistoricoProcedencia(?, ?, ?, ?)', [
            cod_persona,
            instituto,
            lugar_procedencia,
            anio_ingreso
        ]);

        res.status(201).json({ mensaje: 'Histórico de procedencia creado exitosamente' });
    } catch (error) {
        console.error('Error al crear el histórico de procedencia:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para actualizar un registro del historico de procedencia
export const actualizarHistoricoProcedencia = async (req, res) => {
    const { cod_procedencia } = req.params;
    const {
        cod_persona,
        instituto,
        lugar_procedencia,
        anio_ingreso
    } = req.body;

    try {
        await pool.query('CALL P_Put_HistoricoProcedencia(?, ?, ?, ?, ?)', [
            cod_procedencia,
            cod_persona,
            instituto,
            lugar_procedencia,
            anio_ingreso
        ]);

        res.status(200).json({ mensaje: 'Histórico de procedencia actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el histórico de procedencia:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para eliminar un registro del historico de procedencia
export const eliminarHistoricoProcedencia = async (req, res) => {
    const { cod_procedencia } = req.params;

    try {
        const [rows] = await pool.query("CALL P_Delete_HistoricoProcedencia(?)", [cod_procedencia]);

        if (rows.affectedRows > 0) {
            res.status(200).json({ message: 'Histórico de procedencia eliminado correctamente.' });
        } else {
            res.status(404).json({ message: 'No se encontró el registro del histórico de procedencia especificado.' });
        }
    } catch (error) {
        console.error('Error al eliminar el histórico de procedencia:', error);
        res.status(500).json({ message: 'Ocurrió un error al intentar eliminar el registro del histórico de procedencia.', error: error.message });
    }
};
