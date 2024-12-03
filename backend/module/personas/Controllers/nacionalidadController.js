import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


export const obtenerTodasNacionalidades = async (req, res) => {
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


export const crearNacionalidad = async (req, res) => {
    const { Id_nacionalidad, pais_nacionalidad, pais } = req.body;

    try {
        await pool.query('CALL P_Post_Nacionalidad(?, ?, ?)', [
            Id_nacionalidad,
            pais_nacionalidad,
            pais
        ]);

        res.status(201).json({ Mensaje: 'Nacionalidad creada exitosamente' });
    } catch (error) {
        console.error('Error al crear nacionalidad:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

export const actualizarNacionalidad = async (req, res) => {
    const { Cod_nacionalidad } = req.params; // Código de la nacionalidad desde la URL
    const { Id_nacionalidad, pais_nacionalidad, pais } = req.body;

    try {
        await pool.query('CALL P_Put_Nacionalidad(?, ?, ?, ?)', [
            Cod_nacionalidad,
            Id_nacionalidad,
            pais_nacionalidad,
            pais
        ]);

        res.status(200).json({ Mensaje: 'Nacionalidad actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar nacionalidad:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};


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

