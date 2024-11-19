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


export const crearAula = async (req, res) => {
    const { p_Numero_aula, p_Capacidad, p_Cupos_aula, p_Division, p_Secciones_disponibles, p_Secciones_ocupadas, p_Cod_edificio } = req.body;

    try {
        // Verifica que se proporcionen todos los parámetros requeridos
        if (p_Numero_aula == null || p_Capacidad == null || p_Cupos_aula == null || p_Division == null || p_Secciones_disponibles == null || p_Secciones_ocupadas == null || p_Cod_edificio == null) {
            return res.status(400).json({ mensaje: "Todos los campos son requeridos." });
        }

        // Llama al procedimiento almacenado para insertar el aula
        const [result] = await pool.query('CALL sp_insertar_aulas(?, ?, ?, ?, ?, ?, ?)', [p_Numero_aula, p_Capacidad, p_Cupos_aula, p_Division, p_Secciones_disponibles, p_Secciones_ocupadas, p_Cod_edificio]);

        // Verifica si el procedimiento almacenado devolvió un error
        if (result.affectedRows === 0) {
            return res.status(400).json({ mensaje: "El aula ya existe en el edificio especificado o no se pudo insertar." });
        }

        // Captura el ID insertado si está disponible
        const nuevoId = result[0]?.[0]?.nuevo_id || null;

        return res.status(201).json({ mensaje: "Aula insertada con éxito", nuevo_id: nuevoId });
    } catch (error) {
        console.error("Error al insertar el aula:", error);
        // Verifica si el error es un mensaje SQLSTATE personalizado
        if (error.code === 'ER_SIGNAL_EXCEPTION' || error.sqlState === '45000') {
            return res.status(400).json({ mensaje: error.message });
        }
        return res.status(500).json({ mensaje: "Error al insertar el aula." });
    }
};



export const obtenerEdificios = async (req, res) => {
    try {
        const [edificios] = await pool.query('SELECT Cod_edificio, Nombre_edificios FROM tbl_edificio');

        // Verifica si los edificios contienen los datos esperados
        console.log("Datos de edificios cargados:", edificios);

        if (edificios.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron edificios.' });
        }

        res.status(200).json(edificios); // Devuelve ambos campos
    } catch (error) {
        console.error("Error al obtener edificios:", error);
        res.status(500).json({ mensaje: 'Error en el servidor al obtener edificios.' });
    }
};

// Controlador para actualizar aulas
export const actualizarAula = async (req, res) => {
    const { Cod_aula } = req.params;

    const {
        p_Numero_aula,
        p_Capacidad,
        p_Cupos_aula,
        p_Cod_edificio,
        p_Division,
        p_Secciones_ocupadas
    } = req.body;

    // Muestra los datos recibidos en el log
    console.log('Datos recibidos:', {
        Cod_aula,
        p_Numero_aula,
        p_Capacidad,
        p_Cupos_aula,
        p_Cod_edificio,
        p_Division,
        p_Secciones_ocupadas
    });

    // Verifica si p_Cod_edificio está definido y es un número
    if (!p_Cod_edificio || isNaN(p_Cod_edificio)) {
        return res.status(400).json({ mensaje: 'Error: p_Cod_edificio es obligatorio y debe ser un número válido.' });
    }

    try {
        // Verifica que el edificio existe antes de llamar al procedimiento
        const [edificioExistente] = await pool.query('SELECT Nombre_edificios FROM tbl_edificio WHERE Cod_edificio = ?', [p_Cod_edificio]);
        
        if (edificioExistente.length === 0) {
            return res.status(400).json({ mensaje: 'Error: El edificio especificado no existe.' });
        }

        // Llama al procedimiento almacenado para actualizar el aula
        await pool.query('CALL sp_actualizar_aula(?, ?, ?, ?, ?, ?, ?)', [
            Cod_aula,
            p_Numero_aula,
            p_Capacidad,
            p_Cupos_aula,
            p_Cod_edificio,
            p_Division,
            p_Secciones_ocupadas
        ]);

        // Recupera el nombre del edificio para el mensaje de respuesta
        const [result] = await pool.query('SELECT Nombre_edificios FROM tbl_edificio WHERE Cod_edificio = ?', [p_Cod_edificio]);

        res.status(200).json({ 
            mensaje: 'Aula actualizada exitosamente',
            Nombre_edificio: result[0].Nombre_edificios
        });
    } catch (error) {
        console.error('Error al actualizar el aula:', error);
        // Asegúrate de enviar el mensaje de error
        res.status(500).json({ mensaje:  error.message });
    }
};




// Controlador para eliminar un aula
export const eliminarAula = async (req, res) => {
    const { Cod_aula } = req.params;

    try {
        // Llamar al procedimiento almacenado para eliminar el aula
        const [rows] = await pool.query("CALL sp_eliminar_aula(?)", [Cod_aula]);

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
