import conectarDB from '../../../config/db.js';
const pool = await conectarDB();

export const obtenerTodosTelefonos = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL P_Get_Telefonos()');
        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ mensaje: 'No se encontraron teléfonos' });
        }
    } catch (error) {
        console.error('Error al obtener los teléfonos:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Crear un teléfono
export const crearTelefono = async (req, res) => {
    const { cod_persona, telefono } = req.body;
    try {
        await pool.query('CALL P_Post_Telefono(?, ?)', [cod_persona, telefono]);
        res.status(201).json({ mensaje: 'Teléfono creado exitosamente' });
    } catch (error) {
        console.error('Error al crear teléfono:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Actualizar un teléfono
export const actualizarTelefono = async (req, res) => {
    const { Cod_telefono } = req.params;
    const { cod_persona, telefono } = req.body;
    try {
        await pool.query('CALL P_Put_Telefono(?, ?, ?)', [Cod_telefono, cod_persona, telefono]);
        res.status(200).json({ mensaje: 'Teléfono actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar teléfono:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Eliminar un teléfono
export const eliminarTelefono = async (req, res) => {
    const { Cod_telefono } = req.params;
    try {
        await pool.query('CALL P_Delete_Telefono(?)', [Cod_telefono]);
        res.status(200).json({ mensaje: 'Teléfono eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar teléfono:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};
