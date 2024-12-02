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

// Obtener detalle del periodo
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
