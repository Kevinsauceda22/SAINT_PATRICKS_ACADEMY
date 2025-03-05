import conectarDB from '../../../config/db.js';
const pool = await conectarDB();

// Controlador para obtener los registros de historico procedencia
export const obtenerHistoricoProcedencia = async (req, res) => {
    const { cod_procedencia } = req.params; // Extraemos el parámetro de la URL

    try {
        let query;
        let params;

        // Si se proporciona un código de procedencia, busca un registro específico, de lo contrario, busca todos
        if (cod_procedencia) {
            query = 'CALL sp_obtener_historico_procedencia(?)'; // Procedimiento almacenado para un registro específico
            params = [cod_procedencia];
        } else {
            query = 'CALL sp_obtener_historico_procedencia(0)'; // Procedimiento almacenado para todos los registros
            params = [null];
        }

        // Ejecuta la consulta en la base de datos
        const [rows] = await pool.query(query, params);

        // Verificar si se encontraron registros
        if (!rows || rows[0].length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron registros de procedencia.' });
        }

        // Devuelve los resultados al cliente
        res.status(200).json(rows[0]); // Solo toma el primer resultado que contiene las filas
    } catch (error) {
        console.error('Error al obtener los registros de procedencia:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para crear un registro de historico procedencia
export const crearHistoricoProcedencia = async (req, res) => {
    const { p_Nombre_procedencia, p_Lugar_procedencia, p_Instituto } = req.body; // Extraemos los valores del cuerpo de la petición

    try {
        // Verifica que se proporcionen los parámetros requeridos
        if (!p_Nombre_procedencia || !p_Lugar_procedencia || !p_Instituto) {
            return res.status(400).json({ mensaje: "Los campos 'Nombre_procedencia', 'Lugar_procedencia' e 'Instituto' son requeridos." });
        }

        // Llama al procedimiento almacenado para insertar el registro
        const [result] = await pool.query('CALL sp_insertar_historico_procedencia(?, ?, ?)', [p_Nombre_procedencia, p_Lugar_procedencia, p_Instituto]);

        // Obtiene el último ID insertado
        const [lastIdResult] = await pool.query('SELECT LAST_INSERT_ID() AS lastId');
        const insertId = lastIdResult[0].lastId;

        // Responde con un mensaje de éxito incluyendo el ID generado
        return res.status(201).json({ mensaje: "Registro de procedencia insertado con éxito", insertId: insertId });
    } catch (error) {
        console.error("Error al insertar el registro de procedencia:", error);
        if (error.sqlMessage) {
            return res.status(400).json({ mensaje: error.sqlMessage });
        }

        return res.status(500).json({ mensaje: "Error al insertar el registro de procedencia." });
    }
};

// Controlador para actualizar un registro de historico procedencia
export const actualizarHistoricoProcedencia = async (req, res) => {
    const { p_cod_procedencia, p_Nombre_procedencia, p_Lugar_procedencia, p_Instituto } = req.body;

    try {
        // Verifica que se proporcione el código de procedencia
        if (!p_cod_procedencia) {
            return res.status(400).json({ mensaje: "El campo 'cod_procedencia' es requerido." });
        }

        // Llama al procedimiento almacenado para actualizar el registro
        const result = await pool.query('CALL sp_actualizar_historico_procedencia(?, ?, ?, ?)', [
            p_cod_procedencia,
            p_Nombre_procedencia,
            p_Lugar_procedencia,
            p_Instituto,
        ]);

        // Respuesta exitosa
        return res.status(200).json({ mensaje: 'Registro de procedencia actualizado correctamente.' });
    } catch (error) {
        console.error('Error al actualizar el registro de procedencia:', error);
        
        if (error.sqlState === '45000') {
            return res.status(400).json({ mensaje: error.message });
        }

        return res.status(500).json({ mensaje: 'Error en el servidor' });
    }
};

// Controlador para eliminar un registro de historico procedencia
export const eliminarHistoricoProcedencia = async (req, res) => {
    const { cod_procedencia } = req.params; // Extraemos el código de procedencia desde los parámetros de la URL

    try {
        // Llamar al procedimiento almacenado para eliminar el registro
        const [rows] = await pool.query('CALL sp_eliminar_historico_procedencia(?)', [cod_procedencia]);

        // Verificar si se eliminó algún registro
        if (rows.affectedRows > 0) {
            return res.status(200).json({ mensaje: 'Registro de procedencia eliminado correctamente.' });
        } else {
            return res.status(404).json({ mensaje: 'No se encontró el registro de procedencia especificado.' });
        }
    } catch (error) {
        console.error('Error al eliminar el registro de procedencia:', error);

        if (error.sqlState === '45000') {
            return res.status(400).json({ mensaje: error.message });
        }

        return res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};
