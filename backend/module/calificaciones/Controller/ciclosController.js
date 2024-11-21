import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


// Obtener todos los ciclos
export const obtenerCiclos = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL get_all_ciclos()');
        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron ciclos' });
        }
    } catch (error) {
        console.error('Error al obtener los ciclos:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Crear un nuevo ciclo
export const crearCiclo = async (req, res) => {
    const { Nombre_ciclo } = req.body;

    try {
        await pool.query('CALL insert_ciclos(?)', [Nombre_ciclo]);
        res.status(201).json({ Mensaje: 'Ciclo creado exitosamente' });
    } catch (error) {
        console.error('Error al crear el ciclo:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Actualizar un ciclo
export const actualizarCiclo = async (req, res) => {
    const { Cod_ciclo, Nombre_ciclo } = req.body;

    //console.log('Datos recibidos para actualizar el ciclo:', req.body); 

    try {
        await pool.query('CALL update_ciclos(?, ?)', [Cod_ciclo, Nombre_ciclo]);
        res.status(200).json({ Mensaje: 'Ciclo actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el ciclo:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Eliminar un ciclo
export const eliminarCiclo = async (req, res) => {
    const { Cod_ciclo } = req.body; 

    if (!Cod_ciclo) {
        return res.status(400).json({ Mensaje: 'Cod_ciclo es requerido' });
    }

    try {
        await pool.query('CALL delete_ciclos(?)', [Cod_ciclo]);
        res.status(200).json({ Mensaje: 'El ciclo fue eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el ciclo:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
