import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


// Obtener todos los grados
export const obtenerGrados = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL get_all_grados()');
        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron grados' });
        }
    } catch (error) {
        console.error('Error al obtener los grados:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Crear un nuevo grado
export const crearGrado = async (req, res) => {
    const { Cod_ciclo, Nombre_grado, Prefijo } = req.body;

    try {
        await pool.query('CALL insert_grados(?, ?, ?)', [
            Cod_ciclo,
            Nombre_grado,
            Prefijo
        ]);

        res.status(201).json({ Mensaje: 'Grado creado exitosamente' });
    } catch (error) {
        console.error('Error al crear el grado:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Actualizar un grado
export const actualizarGrado = async (req, res) => {
    const { Cod_grado, Cod_ciclo, Nombre_grado, Prefijo } = req.body;

  //  console.log('Datos recibidos para actualizar el grado:', req.body); 

    try {
        await pool.query('CALL update_grados(?, ?, ?, ?)', [
            Cod_grado,
            Cod_ciclo,
            Nombre_grado,
            Prefijo
        ]);

        res.status(200).json({ Mensaje: 'Grado actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el grado:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Eliminar un grado
export const eliminarGrado = async (req, res) => {
    const { Cod_grado } = req.body; 

    if (!Cod_grado) {
        return res.status(400).json({ Mensaje: 'Cod_grado es requerido' });
    }

    try {
        await pool.query('CALL delete_grados(?)', [Cod_grado]);
        res.status(200).json({ Mensaje: 'El grado fue eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el grado:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
