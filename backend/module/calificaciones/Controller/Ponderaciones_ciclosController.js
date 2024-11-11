import conectarDB from '../../../config/db.js';
const pool = await conectarDB();

export const obtenerPonderacionesCiclos = async (req, res) => {
    const { Cod_ciclo } = req.params; // Obtener el código del ciclo desde los parámetros de la URL

    if (!Cod_ciclo) {
        return res.status(400).json({ Mensaje: 'El código de ciclo es obligatorio.' });
    }

    try {
        const [rows] = await pool.query('CALL verPonderaciones_Ciclosporciclo(?)', [Cod_ciclo]);

        if (rows[0].length > 0) {
            res.status(200).json(rows[0]); // Responder con los datos obtenidos
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron datos' });
        }
    } catch (error) {
        console.error('Error al obtener las ponderaciones:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};



// Crear un nuevo ciclo
export const crearPonderacionesCiclos = async (req, res) => {
    const { Cod_ponderacion, Cod_ciclo, Valor } = req.body;

    try {
        await pool.query('CALL insert_Ponderaciones_Ciclos(?,?,?)', [Cod_ponderacion, Cod_ciclo, Valor]);
        res.status(201).json({ Mensaje: 'Creado exitosamente' });
    } catch (error) {
        console.error('Error al crear:', error);
        // Verifica si hay un mensaje de error SQL específico
        const errorMessage = error.sqlMessage || 'Error en el servidor';
        res.status(500).json({ Mensaje: errorMessage });
    }
};


// Actualizar un ciclo
export const actualizarPonderacionesCiclos = async (req, res) => {
    const { Cod_ponderacion_ciclo , Cod_ponderacion, Cod_ciclo , Valor } = req.body;


    try {
        await pool.query('CALL update_Ponderaciones_Ciclos (?,?,?,?)', [Cod_ponderacion_ciclo , Cod_ponderacion, Cod_ciclo , Valor ]);
        res.status(200).json({ Mensaje: 'Actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Eliminar un ciclo
export const eliminarPonderacionesCiclos = async (req, res) => {
    const { Cod_ponderacion_ciclo } = req.body; 

    if (!Cod_ponderacion_ciclo) {
        return res.status(400).json({ Mensaje: 'Cod_ponderacion_ciclo es requerido' });
    }

    try {
        await pool.query('CALL delete_Ponderaciones_ciclos(?)', [Cod_ponderacion_ciclo]);
        res.status(200).json({ Mensaje: 'Eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
export const getPonderacionesCiclos = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL verPonderacionesCiclos()');
        
        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron profesores' });
        }
    } catch (error) {
        console.error('Error al obtener la lista de profesores:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};