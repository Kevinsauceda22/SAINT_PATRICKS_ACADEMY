import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


// Controlador para obtener los registros de procedencia persona
export const obtenerProcedenciaPersona = async (req, res) => {
    const { cod_procedencia_persona } = req.params; // Extraemos el parámetro de la URL

    try {
        let query;
        let params;

        // Si se proporciona un código de procedencia persona, busca un registro específico
        if (cod_procedencia_persona) {
            query = 'CALL sp_obtener_procedencia_persona(?)'; // Procedimiento almacenado para un registro específico
            params = [cod_procedencia_persona];
        } else {
            query = 'CALL sp_obtener_procedencia_persona(0)'; // Procedimiento almacenado para todos los registros
            params = [null];
        }

        // Ejecuta la consulta en la base de datos
        const [rows] = await pool.query(query, params);

        // Verificar si se encontraron registros
        if (!rows || rows[0].length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron registros de procedencia persona.' });
        }

        // Devuelve los resultados al cliente
        res.status(200).json(rows[0]); // Solo toma el primer resultado que contiene las filas
    } catch (error) {
        console.error('Error al obtener los registros de procedencia persona:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

export const getNombreApellidoPersona = async (req, res) => {
    const { cod_persona } = req.params; // Captura el parámetro en la URL
    console.log('Parámetro recibido:', cod_persona); // Log para verificar el parámetro recibido

    try {
        // Consulta SQL para obtener el nombre y el primer apellido
        const query = `
            SELECT 
                cod_persona, 
                Nombre, 
                Primer_apellido
            FROM tbl_personas
            WHERE cod_persona = ?`;

        // Ejecutar la consulta
        const [resultado] = await pool.query(query, [cod_persona]);

        console.log('Resultado de la consulta:', resultado); // Log para verificar el resultado de la consulta

        // Validar si se encontró algún registro
        if (resultado.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron datos para el código de persona proporcionado' });
        }

        res.json(resultado[0]); // Devuelve el primer registro encontrado (debe ser único)
    } catch (error) {
        console.error('Error al obtener datos de la persona:', error.message); // Log detallado del error
        res.status(500).json({ mensaje: 'Error al obtener los datos de la persona' });
    }
};


// Controlador para insertar en procedencia persona
export const crearProcedenciaPersona = async (req, res) => {
    const { p_Nombre_procedencia, p_Nombre_persona, p_Anio_procedencia, p_Grado_procedencia } = req.body;

    try {
        // Verifica que se proporcionen todos los parámetros requeridos
        if (!p_Nombre_procedencia || !p_Nombre_persona || !p_Anio_procedencia || !p_Grado_procedencia) {
            return res.status(400).json({
                mensaje: "Los campos 'Nombre_procedencia', 'Nombre_persona', 'Anio_procedencia' y 'Grado_procedencia' son requeridos.",
            });
        }

        // Llama al procedimiento almacenado
        await pool.query('CALL sp_insertar_procedencia_persona(?, ?, ?, ?)', [
            p_Nombre_procedencia,
            p_Nombre_persona,
            p_Anio_procedencia,
            p_Grado_procedencia,
        ]);

        // Responde con un mensaje de éxito
        return res.status(201).json({ mensaje: "Registro de procedencia persona insertado con éxito" });
    } catch (error) {
        console.error("Error al insertar el registro de procedencia persona:", error);

        // Manejo de errores SQL (por ejemplo, errores del procedimiento almacenado)
        if (error.sqlMessage) {
            return res.status(400).json({ mensaje: error.sqlMessage });
        }

        // Responde con un error genérico si ocurre algo inesperado
        return res.status(500).json({ mensaje: "Error al insertar el registro de procedencia persona." });
    }
};

// Controlador para obtener la lista de procedencias
export const obtenerProcedencias = async (req, res) => {
    try {
        // Consulta para obtener las procedencias
        const query = `
            SELECT 
                cod_procedencia, 
                Nombre_procedencia 
            FROM tbl_historico_procedencia
        `;

        // Ejecutar la consulta
        const [procedencias] = await pool.query(query);

        // Validar si hay datos
        if (procedencias.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron procedencias.' });
        }

        // Responder con los datos
        res.status(200).json(procedencias);
    } catch (error) {
        console.error('Error al obtener procedencias:', error.message);
        res.status(500).json({ mensaje: 'Error al obtener las procedencias.', error: error.message });
    }
};
// Controlador para obtener la lista de personas
export const obtenerPersonas = async (req, res) => {
    try {
        // Consulta para obtener las personas
        const query = `
            SELECT 
                cod_persona, 
                Nombre, 
                Primer_apellido 
            FROM tbl_personas
        `;

        // Ejecutar la consulta
        const [personas] = await pool.query(query);

        // Validar si hay datos
        if (personas.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron personas.' });
        }

        // Responder con los datos
        res.status(200).json(personas);
    } catch (error) {
        console.error('Error al obtener personas:', error.message);
        res.status(500).json({ mensaje: 'Error al obtener las personas.', error: error.message });
    }
};
