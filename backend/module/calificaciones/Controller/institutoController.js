import conectarDB from '../../../config/db.js';
const pool = await conectarDB();

// Obtener todos los institutos
export const obtenerInstitutos = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL get_institutos');
        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron institutos' });
        }
    } catch (error) {
        console.error('Error al obtener institutos:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Crear un nuevo instituto
export const crearInstituto = async (req, res) => {
    const {Nom_Instituto} = req.body;

    try {
        await pool.query('CALL insert_instituto(?)', [
            Nom_Instituto
        ]);
        res.status(201).json({ Mensaje: 'Instituto agregado exitosamente' });
    } catch (error) {
        console.error('Error al agregar el instituto:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

//Actualizar un Instituto
export const actualizarinstituto = async (req, res) => {
    const {Cod_Instituto, Nom_Instituto } = req.body;

    try {
        await pool.query('CALL update_instituto(?, ?)', [
            Cod_Instituto,
            Nom_Instituto
        ]);
        res.status(200).json({Mensaje: 'Instituto actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el instituto: ', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

//Eliminar un instituto
export const eliminarinstituto = async (req, res) => {
    const { Cod_Instituto } = req.body;

    try {
        await pool.query('CALL delete_instituto(?)', [Cod_Instituto]);
        res.status(200).json({ Mensaje: 'Instituto eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el instituto:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
