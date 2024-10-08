import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


//Controlador para obtener todas o una aula
export const obtenerAula = async (req, res) => {
    const { Numero_aula } = req.params; // Extraemos el parámetro de la URL

    try {
        // Si el valor es vacío o 'null', lo pasamos como null explícitamente al procedimiento almacenado
        const query = 'CALL sp_get_Aula(?)';
        const [results] = await pool.query(query, [
            Numero_aula && Numero_aula !== 'null' ? Numero_aula : null
        ]);

        // Verificar si se encontraron registros
        if (results[0].length === 0) {
            return res.status(404).json({ message: 'Aula no encontrada' });
        }

        return res.status(200).json(results[0]); // Asegúrate de acceder al primer elemento del array
    } catch (error) {
        console.error('Error al obtener el aula:', error);
        res.status(500).json({ message: 'Error al obtener el aula', error });
    }
};


//Controlador para crear una aula
export const crearAula = async (req, res) => {
    const {
        p_Numero_aula,
        p_Capacidad,
        p_Cupos_aula,
        p_Nombre_edificio,
        p_Division,
        p_Secciones_disponibles
    } = req.body;

    try {
        await pool.query('CALL sp_insert_Aula(?, ?, ?, ?, ?, ?)', [
            p_Numero_aula,
            p_Capacidad,
            p_Cupos_aula,
            p_Nombre_edificio,
            p_Division,
            p_Secciones_disponibles
        ]);

        res.status(201).json({ mensaje: 'Aula creada exitosamente' });
    } catch (error) {
        console.error('Error al crear el aula:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};


// Controlador para actualizar un aula
export const actualizarAula = async (req, res) => {
    const {
        p_Item,                   // Código del Aula (Cod_aula)
        p_Numero_aula,           // Número de Aula
        p_Capacidad,             // Capacidad del Aula
        p_Cupos_aula,            // Cupos Disponibles
        p_Nombre_edificio,       // Nombre del Edificio
        p_Division,              // Número de Divisiones Permitidas
        p_Secciones_ocupadas      // Secciones Ocupadas
    } = req.body;

    try {
        await pool.query('CALL sp_update_Aula(?, ?, ?, ?, ?, ?, ?)', [
            p_Item,
            p_Numero_aula,
            p_Capacidad,
            p_Cupos_aula,
            p_Nombre_edificio,
            p_Division,
            p_Secciones_ocupadas
        ]);

        res.status(200).json({ mensaje: 'Aula actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el aula:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};


// Controlador para eliminar un aula
export const eliminarAula = async (req, res) => {
    const { p_Numero_aula } = req.params; // Extraer el número de aula desde los parámetros de la URL

    try {
        const [rows] = await pool.query("CALL sp_delete_Aula(?)", [p_Numero_aula]);

        // Si se eliminaron filas, el aula fue eliminada
        if (rows.affectedRows > 0) {
            return res.status(200).json({ message: 'Aula eliminada correctamente.' });
        } else {
            return res.status(404).json({ message: 'No se encontró el aula especificada.' });
        }
    } catch (error) {
        console.error('Error al eliminar el aula:', error);
        return res.status(500).json({ message: 'Ocurrió un error al intentar eliminar el aula.', error });
    }
};