import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


// Controlador para obtener aulas
export const obtenerAula = async (req, res) => {
    const { Cod_aula } = req.query; // Obtiene el código del aula desde la consulta

    try {
        let query;
        let params;

        // Si se proporciona un código de aula, busca una aula específica, de lo contrario, busca todas las aulas
        if (Cod_aula) {
            query = 'CALL sp_obtener_aulas(?)'; // Procedimiento almacenado para una aula específica
            params = [Cod_aula];
        } else {
            query = 'CALL sp_obtener_aulas(0)'; // Procedimiento almacenado para todas las aulas
            params = [null];
        }

        // Ejecuta la consulta en la base de datos
        const [rows] = await pool.query(query, params);

        // Verifica si hay resultados
        if (!rows || rows[0].length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron aulas.' });
        }

        // Devuelve los resultados al cliente
        res.status(200).json(rows[0]); // Solo toma el primer resultado que contiene las filas
    } catch (error) {
        console.error('Error al obtener las aulas:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};



// Controlador para crear un aula
export const crearAula = async (req, res) => {
    const { Numero_aula, Capacidad, Cupos_aula, Division, Secciones_disponibles, Secciones_ocupadas, Cod_edificio } = req.body;

    try {
        // Verifica que se proporcionen todos los parámetros requeridos
        if (Numero_aula == null || Capacidad == null || Cupos_aula == null || Division == null || Secciones_disponibles == null || Secciones_ocupadas == null || Cod_edificio == null) {
            return res.status(400).json({ mensaje: "Todos los campos son requeridos." });
        }

        // Llama al procedimiento almacenado para insertar el aula
        const [result] = await pool.query('CALL sp_insertar_aula(?, ?, ?, ?, ?, ?, ?)', [Numero_aula, Capacidad, Cupos_aula, Division, Secciones_disponibles, Secciones_ocupadas, Cod_edificio]);

        // Responde con un mensaje de éxito
        return res.status(201).json({ mensaje: "Aula insertada con éxito", data: result });
    } catch (error) {
        console.error("Error al insertar el aula:", error);
        return res.status(500).json({ mensaje: "Error al insertar el aula." });
    }
};


/// Controlador para actualizar un aula
export const actualizarAula = async (req, res) => {
    const { Cod_aula } = req.params; // Obtiene el código del aula desde la URL

    const {
        p_Numero_aula,           // Número de Aula
        p_Capacidad,             // Capacidad del Aula
        p_Cupos_aula,            // Cupos Disponibles
        p_Nombre_edificios,       // Nombre del Edificio
        p_Division,              // Número de Divisiones Permitidas
        p_Secciones_ocupadas     // Secciones Ocupadas
    } = req.body;

    try {
        await pool.query('CALL sp_actualizar_aulas(?, ?, ?, ?, ?, ?, ?)', [
            Cod_aula,            // Usamos Cod_aula desde params
            p_Numero_aula,
            p_Capacidad,
            p_Cupos_aula,
            p_Nombre_edificios,
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
    const { Cod_aula } = req.params;

    try {
        // Llamar al procedimiento almacenado para eliminar el aula
        const [rows] = await pool.query("CALL sp_delete_Aula(?)", [Cod_aula]);

        // Comprobar si se afectaron filas (es decir, si el aula fue eliminada)
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
