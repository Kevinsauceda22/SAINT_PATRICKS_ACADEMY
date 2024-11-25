import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


// Controlador para obtener todos los agrupadores
export const obtenerAgrupadores = async (req, res) => {
    try {
        // Ejecutar el procedimiento almacenado
        const [rows] = await pool.query('CALL sp_obtener_TotalSeccionesAgrupadores()');

        // Verificar si hay resultados
        if (!rows || rows[0].length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron agrupadores.' });
        }

        // Devolver los resultados
        res.status(200).json(rows[0]);
    } catch (error) {
        // Manejar errores
        console.error('Error al obtener los agrupadores:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para obtener todos los periodos de matrícula
export const obtenerPeriodos = async (req, res) => {
    try {
        // Consulta para obtener todos los períodos de matrícula
        const [rows] = await pool.query(`
            SELECT Cod_periodo_matricula, Anio_academico, Estado
            FROM tbl_periodo_matricula
        `);

        // Verificar si hay resultados
        if (rows.length > 0) {
            res.status(200).json(rows); // Devuelve todos los períodos encontrados
        } else {
            res.status(404).json({ mensaje: 'No se encontraron períodos de matrícula' });
        }
    } catch (error) {
        console.error('Error al obtener los períodos de matrícula:', error);
        res.status(500).json({ mensaje: 'Error al obtener los períodos de matrícula' });
    }
};

// Controlador para insertar agrupadores en tbl_historial_secciones
export const insertarAgrupador = async (req, res) => {
    try {
        // Llamada al procedimiento almacenado
        const [result] = await pool.query('CALL sp_insertar_agrupacion_secciones()');

        // Verificar si se insertó correctamente
        if (result.affectedRows === 0) {
            return res.status(400).json({ mensaje: "No se pudo insertar el agrupador. Ya existe una agrupación para el período activo." });
        }

        // Respuesta exitosa
        return res.status(201).json({ mensaje: "Agrupador insertado con éxito", data: result });
    } catch (error) {
        console.error('Error al insertar el agrupador:', error);

        // Manejo del error específico con SIGNAL
        if (error.sqlState === '45000') {
            return res.status(400).json({ mensaje: error.message });
        }

        // Error genérico del servidor
        return res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

export const getDetallePorPeriodo = async (req, res) => {
    const { Cod_periodo_matricula } = req.params;
    console.log('Parámetro recibido:', Cod_periodo_matricula); // Log para verificar el parámetro
    try {
        // Ejecución de la consulta utilizando la tabla `tbl_periodo_matricula`
        const [resultado] = await pool.query(
            'SELECT Cod_periodo_matricula, Fecha_inicio, Fecha_fin, Anio_academico, estado FROM tbl_periodo_matricula WHERE Cod_periodo_matricula = ?',
            [Cod_periodo_matricula]
        );

        console.log('Resultado de la consulta:', resultado); // Log para depurar el resultado de la consulta

        if (resultado.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron datos para el periodo proporcionado' });
        }

        res.json(resultado[0]); // Devuelve los datos del periodo encontrado
    } catch (error) {
        console.error('Error al obtener datos del periodo:', error.message); // Log detallado del error
        res.status(500).json({ mensaje: 'Error al obtener los datos del periodo' });
    }
};

// Obtener todas las agrupaciones con su estado
export const getTodasAgrupaciones = async (req, res) => {
    try {
        // Llamada al procedimiento almacenado
        const [resultado] = await pool.query('CALL `1600-e5`.sp_obtener_TodasAgrupacionesConEstado()');

        // Verificar si hay resultados
        if (resultado.length === 0 || resultado[0].length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron agrupaciones' });
        }

        console.log('Resultado de la consulta:', resultado[0]); // Log para verificar los datos obtenidos

        // Respuesta con las agrupaciones obtenidas
        res.json(resultado[0]);
    } catch (error) {
        console.error('Error al obtener agrupaciones:', error.message); // Log detallado del error
        res.status(500).json({ mensaje: 'Error al obtener las agrupaciones' });
    }
};


// Controlador para obtener secciones por periodo de matrícula
export const obtenerSeccionesPorPeriodo = async (req, res) => {
    const { Cod_periodo_matricula } = req.params; // Extraemos el parámetro de la URL
    console.log('Parámetro recibido:', Cod_periodo_matricula); // Log para depuración

    try {
        // Validar el parámetro
        if (!Cod_periodo_matricula || isNaN(Cod_periodo_matricula)) {
            return res.status(400).json({
                mensaje: 'El parámetro "Cod_periodo_matricula" es obligatorio y debe ser un número válido.',
            });
        }

        // Llamada al procedimiento almacenado
        const [rows] = await pool.query('CALL sp_obtener_secciones_por_periodo(?)', [Cod_periodo_matricula]);

        // Verificar si hay resultados
        if (!rows || rows[0].length === 0) {
            return res.status(404).json({ mensaje: `No se encontraron secciones para el periodo ${Cod_periodo_matricula}.` });
        }

        // Devolver los resultados en formato JSON
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error al obtener las secciones:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};


//CONTROLADORES DE SECCIONES:
// Controlador para obtener secciones
export const obtenerSecciones = async (req, res) => {
    const { Cod_secciones } = req.params; // Extraemos el parámetro de la URL

    try {
        let query = 'CALL sp_obtener_secciones(?)';
        let params = [Cod_secciones ? Cod_secciones : 0]; // Si no se especifica, pasa 0 para obtener todas las secciones

        const [rows] = await pool.query(query, params);

        if (!rows || rows[0].length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron secciones.' });
        }

        res.status(200).json(rows[0]); // Devolver todas las columnas, incluyendo Cod_Profesor y Cod_periodo_matricula
    } catch (error) {
        console.error('Error al obtener las secciones:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};


// Controlador para obtener todos los edificios
export const obtenerEdificios = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT Cod_edificio, Nombre_edificios FROM tbl_edificio'); // Cambia aquí la consulta
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener edificios:', error);
        res.status(500).json({ mensaje: 'Error al obtener edificios', error: error.message });
    }
};


// Controlador para obtener aulas por edificio
export const obtenerAulasPorEdificio = async (req, res) => {
    const { Cod_edificio } = req.params;

    try {
        const [rows] = await pool.query(
            'SELECT Cod_aula, Numero_aula FROM tbl_aula WHERE Cod_edificio = ?', 
            [Cod_edificio]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener aulas por edificio:', error);
        res.status(500).json({ mensaje: 'Error al obtener aulas por edificio', error: error.message });
    }
};

// Controlador para obtener un edificio específico por Cod_edificio
export const obtenerEdificioPorId = async (req, res) => {
    const { Cod_edificio } = req.params;

    try {
        const [rows] = await pool.query(
            'SELECT Cod_edificio, Nombre_edificios, Numero_pisos, Aulas_disponibles FROM tbl_edificio WHERE Cod_edificio = ?', 
            [Cod_edificio]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontró el edificio especificado' });
        }
        
        res.json(rows[0]); // Devolver el primer (y único) resultado
    } catch (error) {
        console.error('Error al obtener el edificio por ID:', error);
        res.status(500).json({ mensaje: 'Error al obtener el edificio', error: error.message });
    }
};



// Controlador para obtener todas las aulas
export const obtenerAulas = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT Cod_aula, Numero_aula FROM tbl_aula');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener aulas:', error);
        res.status(500).json({ mensaje: 'Error al obtener aulas' });
    }
};

// Controlador para obtener todos los grados
export const obtenerGrados = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT Cod_grado, Nombre_grado FROM tbl_grados');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener grados:', error);
        res.status(500).json({ mensaje: 'Error al obtener grados' });
    }
};
// Controlador para obtener todos los profesores
export const obtenerProfesores = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.Cod_profesor, per.Nombre AS Nombre_profesor
            FROM tbl_profesores p
            JOIN tbl_personas per ON p.Cod_persona = per.Cod_persona
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener profesores:', error);
        res.status(500).json({ mensaje: 'Error al obtener profesores' });
    }
};
// Controlador para obtener el periodo de matrícula activo
export const obtenerPeriodoMatriculaActivo = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT Cod_periodo_matricula, Anio_academico 
            FROM tbl_periodo_matricula
        `);
        
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ mensaje: 'No se encontró un periodo de matrícula activo' });
        }
    } catch (error) {
        console.error('Error al obtener el periodo de matrícula activo:', error);
        res.status(500).json({ mensaje: 'Error al obtener el periodo de matrícula activo' });
    }
};

// Controlador para crear una nueva sección
export const crearSeccion = async (req, res) => {
    const { p_Nombre_seccion, p_Cod_aula, p_Cod_grado, p_Cod_Profesor, p_Cod_periodo_matricula } = req.body;

    try {
        // Validación de campos requeridos
        if (!p_Nombre_seccion || !p_Cod_aula || !p_Cod_grado || !p_Cod_Profesor || !p_Cod_periodo_matricula) {
            return res.status(400).json({ mensaje: "Todos los campos son requeridos." });
        }

        // Llamada al procedimiento almacenado
        const [result] = await pool.query(
            'CALL sp_insertar_secciones(?, ?, ?, ?, ?)',
            [p_Nombre_seccion, p_Cod_aula, p_Cod_grado, p_Cod_Profesor, p_Cod_periodo_matricula]
        );

        return res.status(201).json({ mensaje: "Sección insertada con éxito", data: result });
    } catch (error) {
        console.error('Error al insertar la sección:', error);
        if (error.sqlState === '45000') {
            return res.status(400).json({ mensaje: error.message });
        }
        return res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para actualizar una sección
export const actualizarSeccion = async (req, res) => {
    const { p_Cod_secciones, p_Nombre_seccion, p_Numero_aula, p_Nombre_grado, p_Cod_Profesor, p_Cod_periodo_matricula } = req.body;

    try {
        // Validación de campos requeridos
        if (!p_Cod_secciones || !p_Nombre_seccion || !p_Numero_aula || !p_Nombre_grado || !p_Cod_Profesor || !p_Cod_periodo_matricula) {
            return res.status(400).json({ mensaje: "Todos los campos son requeridos." });
        }

        // Validación para verificar si el número de aula existe en la base de datos
        const [aulaResult] = await pool.query('SELECT Cod_aula FROM tbl_aula WHERE Numero_aula = ?', [p_Numero_aula]);
        if (aulaResult.length === 0) {
            return res.status(400).json({ mensaje: "El aula especificada no existe." });
        }

        // Llamar al procedimiento almacenado para actualizar la sección
        const [result] = await pool.query(
            'CALL sp_actualizar_secciones(?, ?, ?, ?, ?, ?)',
            [p_Cod_secciones, p_Nombre_seccion, p_Numero_aula, p_Nombre_grado, p_Cod_Profesor, p_Cod_periodo_matricula]
        );

        return res.status(200).json({ mensaje: 'Sección actualizada correctamente.', data: result });
    } catch (error) {
        console.error('Error al actualizar la sección:', error);
        if (error.sqlState === '45000') {
            return res.status(400).json({ mensaje: error.message });
        }
        return res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};


// Controlador para eliminar una sección
export const eliminarSeccion = async (req, res) => {
    const { Cod_seccion } = req.params;

    try {
        const [result] = await pool.query('CALL sp_eliminar_secciones(?)', [Cod_seccion]);

        if (result.affectedRows > 0) {
            return res.status(200).json({ mensaje: 'Sección eliminada correctamente.' });
        } else {
            return res.status(404).json({ mensaje: 'No se encontró la sección especificada.' });
        }
    } catch (error) {
        console.error('Error al eliminar la sección:', error);
        if (error.sqlState === '45000') {
            return res.status(400).json({ mensaje: error.message });
        }
        return res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};
