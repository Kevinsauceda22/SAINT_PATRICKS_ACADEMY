

import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


export const obtenerDias = async (req, res) => {
    const { Cod_dias } = req.params; // Extraemos el parámetro de la URL

    try {
        let query;
        let params;

        // Si se proporciona un código de día, busca un día específico, de lo contrario, busca todos los días
        if (Cod_dias) {
            query = 'CALL sp_obtener_dias(?)'; // Procedimiento almacenado para un día específico
            params = [Cod_dias];
        } else {
            query = 'CALL sp_obtener_dias(0)'; // Procedimiento almacenado para todos los días
            params = [null];
        }

        // Ejecuta la consulta en la base de datos
        const [rows] = await pool.query(query, params);

        // Verificar si se encontraron registros
        if (!rows || rows[0].length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron días.' });
        }

        // Devuelve los resultados al cliente
        res.status(200).json(rows[0]); // Solo toma el primer resultado que contiene las filas
    } catch (error) {
        console.error('Error al obtener los días:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};


// Controlador para crear un día
export const crearDia = async (req, res) => {
    const { p_dias, p_prefijo_dia } = req.body; // Extraemos 'p_dias' y 'p_prefijo_dia' del cuerpo de la petición

    try {
        // Verifica que se proporcionen ambos parámetros
        if (!p_dias || !p_prefijo_dia) {
            return res.status(400).json({ mensaje: "Todos los campos son requeridos." });
        }

        // Llama al procedimiento almacenado para insertar el día
        const [result] = await pool.query('CALL sp_insertar_dias(?, ?)', [p_dias, p_prefijo_dia]);

        // Obtiene el último ID insertado
        const [lastIdResult] = await pool.query('SELECT LAST_INSERT_ID() AS lastId');
        const insertId = lastIdResult[0].lastId;

        // Responde con un mensaje de éxito incluyendo el ID generado
        return res.status(201).json({ mensaje: "Día insertado con éxito", insertId: insertId });
    } catch (error) {
        console.error("Error al insertar el día:", error);
        if (error.sqlMessage) {
            // Si el error tiene un mensaje SQL, lo enviamos al cliente
            return res.status(400).json({ mensaje: error.sqlMessage });
        }

        // Respuesta genérica para otros errores
        return res.status(500).json({ mensaje: "Error al insertar el día." });
    }
};


// Controlador para actualizar un día
export const actualizarDia = async (req, res) => {
    const { p_Cod_dias, p_Nuevo_dia, p_Nuevo_prefijo } = req.body; // Extraemos los parámetros necesarios

    try {
        // Validación de campos requeridos
        if (!p_Cod_dias || !p_Nuevo_dia || !p_Nuevo_prefijo) {
            return res.status(400).json({ mensaje: "Todos los campos son requeridos." });
        }

        // Llamada al procedimiento almacenado para actualizar el día
        const result = await pool.query('CALL sp_actualizar_dia(?, ?, ?)', [
            p_Cod_dias,
            p_Nuevo_dia,
            p_Nuevo_prefijo,
        ]);

        // Respuesta exitosa
        return res.status(200).json({ mensaje: 'Día actualizado correctamente.' });
    } catch (error) {
        console.error('Error al actualizar el día:', error); // Para depuración

        if (error.sqlMessage) {
            // Si el error tiene un mensaje SQL, lo enviamos al cliente
            return res.status(400).json({ mensaje: error.sqlMessage });
        }

        // Respuesta genérica para otros errores
        return res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

// Controlador para eliminar un día
export const eliminarDia = async (req, res) => {
    const { cod_dias } = req.params; // Extraemos el código del día desde los parámetros de la URL

    try {
        // Llamar al procedimiento almacenado para eliminar el día
        const [rows] = await pool.query('CALL sp_eliminar_dia(?)', [cod_dias]);

        // Verificar si se eliminó algún día
        if (rows.affectedRows > 0) {
            return res.status(200).json({ mensaje: 'Día eliminado correctamente.' });
        } else {
            return res.status(404).json({ mensaje: 'No se encontró el día especificado.' });
        }
    } catch (error) {
        console.error('Error al eliminar el día:', error);

        // Si el error es personalizado (proveniente del procedimiento almacenado)
        if (error.sqlState === '45000') {
            return res.status(400).json({ mensaje: error.message });
        }

        // Para otros errores de servidor
        return res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};
















