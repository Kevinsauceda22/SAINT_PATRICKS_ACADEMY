import conectarDB from '../../../config/db.js';
const pool = await conectarDB();

//Controlador para obtener los edificios
export const obtenerEdificios = async (req, res) => {
    const { Cod_edificio } = req.params; // Extraemos el parámetro de la URL

    try {
        let query;
        let params;

        // Si se proporciona un código de edificio, busca una edificio específico, de lo contrario, busca todos las edificios
        if (Cod_edificio) {
            query = 'CALL sp_obtener_edificios(?)'; // Procedimiento almacenado para un edificio específico
            params = [Cod_edificio];
        } else {
            query = 'CALL sp_obtener_edificios(0)'; // Procedimiento almacenado para todos los edificios
            params = [null];
        }

        // Ejecuta la consulta en la base de datos
        const [rows] = await pool.query(query, params);

        // Verificar si se encontraron registros
        if (!rows || rows[0].length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron edificios.' });
        }

        // Devuelve los resultados al cliente
        res.status(200).json(rows[0]); // Solo toma el primer resultado que contiene las filas
    } catch (error) {
        console.error('Error al obtener los edificios:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};


//Controlador para crear un edificio
export const crearEdificio = async (req, res) => {
    const { p_Nombre_edificio, p_Numero_pisos, p_Aulas_disponibles } = req.body;

    try {
        // Verifica que se proporcionen todos los parámetros requeridos
        if (p_Nombre_edificio == null || p_Numero_pisos == null || p_Aulas_disponibles == null) {
            return res.status(400).json({ mensaje: "Todos los campos son requeridos." });
        }

        // Llama al procedimiento almacenado para insertar el aula
        const [result] = await pool.query('CALL sp_insertar_edificio(?, ?, ?)', [p_Nombre_edificio, p_Numero_pisos, p_Aulas_disponibles]);

        // Responde con un mensaje de éxito
        return res.status(201).json({ mensaje: "Edificio insertado con éxito", data: result });
    } catch (error) {
        console.error("Error al insertar el edificio:", error);
        return res.status(500).json({ mensaje: "Error al insertar el edificio." });
    }
};
    

// Controlador para actualizar un edificio
export const actualizarEdificio = async (req, res) => {
    const { p_Cod_edificio, p_Nuevo_nombre_edificio, p_Numero_pisos, p_Aulas_disponibles } = req.body;

    try {
        const result = await pool.query('CALL sp_actualizar_edificio(?, ?, ?, ?)', [
            p_Cod_edificio,
            p_Nuevo_nombre_edificio,
            p_Numero_pisos,
            p_Aulas_disponibles,
        ]);

        return res.status(200).json({ mensaje: 'Edificio actualizado correctamente.' });
    } catch (error) {
        console.error('Error al actualizar el edificio:', error); // Agrega esto para depurar
        return res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};


//Controlador para eliminar un edificio
export const eliminarEdificio = async (req, res) => {
    const { Cod_edificio } = req.params;

    try {
        // Procedimiento almacenado llamado con el código del edificio
        const [result] = await pool.query("CALL sp_eliminar_edificio(?)", [Cod_edificio]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ message: 'Edificio eliminado correctamente.' });
        } else {
            return res.status(404).json({ message: 'No se encontró el edificio especificado.' });
        }
    } catch (error) {
        console.error('Error al eliminar el edificio:', error);
        return res.status(500).json({ message: 'Ocurrió un error al intentar eliminar el edificio.', error });
    }
};
