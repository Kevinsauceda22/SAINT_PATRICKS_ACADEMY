import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


// Obtener todos los parciales
export const obtenerParciales = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL get_all_parcial()');

        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron parciales' });
        }
    } catch (error) {
        console.error('Error al obtener la lista de parciales:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Crear un nuevo parcial
export const crearParcial = async (req, res) => {
    const { Nombre_parcial, Nota_recuperacion } = req.body;

    try {
        await pool.query('CALL insert_parcial(?, ?)', [
            Nombre_parcial,
            Nota_recuperacion
        ]);

        res.status(201).json({ Mensaje: 'Parcial agregado exitosamente' });
    } catch (error) {
        console.error('Error al agregar el parcial:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Actualizar un parcial
export const actualizarParcial = async (req, res) => {
    const { Cod_parcial, Nombre_parcial, Nota_recuperacion } = req.body;

   // console.log('Datos recibidos:', req.body); // Agregado para verificar datos

    try {
        await pool.query('CALL update_parcial(?, ?, ?)', [
            Cod_parcial,
            Nombre_parcial,
            Nota_recuperacion
        ]);

        res.status(200).json({ Mensaje: 'Parcial actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el parcial:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Eliminar un parcial
export const eliminarParcial = async (req, res) => {  
    const { Cod_parcial } = req.body;  

    if (!Cod_parcial) {
        return res.status(400).json({ Mensaje: 'Cod_parcial es requerido' });
    }

    try {  
        await pool.query('CALL delete_parcial(?)', [Cod_parcial]);  
        res.status(200).json({ Mensaje: 'Parcial eliminada exitosamente' });  
    } catch (error) {  
        console.error('Error al eliminar el parcial:', error);  
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });  
    }  
};
