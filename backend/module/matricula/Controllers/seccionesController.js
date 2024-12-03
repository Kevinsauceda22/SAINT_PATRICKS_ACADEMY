import conectarDB from '../../../config/db.js';
const pool = await conectarDB();

// Obtener secciones por id
export const obtenerSeccionPorId = async (req, res) => {
    const { Cod_secciones } = req.params;

    try {
        const [rows] = await pool.query('CALL sp_obtener_seccion_por_id(?)', [Cod_secciones]);

        if (rows[0].length === 0) {
            return res.status(404).json({ mensaje: 'Sección no encontrada.' });
        }

        res.status(200).json(rows[0][0]); // Enviar los datos al frontend
    } catch (error) {
        console.error('Error al obtener la sección por ID:', error);
        res.status(500).json({ mensaje: 'Error al obtener la sección.', error: error.message });
    }
};

// Obtener el período académico activo
export const obtenerPeriodoActivo = async (req, res) => {
    try {
        // Consulta para obtener el período activo
        const query = `
            SELECT Cod_periodo_matricula, Anio_academico
            FROM tbl_periodo_matricula
            WHERE estado = 'activo'
            LIMIT 1;
        `;

        // Ejecutar la consulta
        const [rows] = await pool.query(query);

        // Verificar si se encontró un período activo
        if (rows.length === 0) {
            return res.status(404).json({ mensaje: "No hay un período académico activo." });
        }

        // Retornar el período activo
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Error al obtener el período académico activo:", error);
        res.status(500).json({ mensaje: "Error al obtener el período académico activo.", error: error.message });
    }
};

// Obtener secciones por periodo
export const obtenerSeccionesPorPeriodo = async (req, res) => {
    const { Cod_periodo_matricula } = req.params;

    console.log("Cod_periodo_matricula recibido:", Cod_periodo_matricula);

    if (!Cod_periodo_matricula) {
        return res.status(400).json({ mensaje: "El código del periodo de matrícula es requerido." });
    }

    try {
        const query = `
            SELECT 
                s.Cod_secciones,
                s.Nombre_seccion,
                a.Numero_aula,
                g.Nombre_grado,
                s.Cod_Profesor,
                s.Cod_periodo_matricula
            FROM tbl_secciones s
            JOIN tbl_aula a ON s.Cod_aula = a.Cod_aula
            JOIN tbl_grados g ON s.Cod_grado = g.Cod_grado
            JOIN tbl_periodo_matricula p ON s.Cod_periodo_matricula = p.Cod_periodo_matricula
            WHERE s.Cod_periodo_matricula = ?;
        `;

        console.log("Ejecutando consulta con:", query, Cod_periodo_matricula);

        const [rows] = await pool.query(query, [Cod_periodo_matricula]);

        console.log("Resultado de la consulta:", rows);

        if (rows.length === 0) {
            return res.status(404).json({ mensaje: "No se encontraron secciones para el periodo proporcionado." });
        }

        res.status(200).json(rows);
    } catch (error) {
        console.error("Error en la consulta:", error);
        res.status(500).json({ mensaje: "Error al obtener las secciones.", error });
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

// Controlador para obtener las secciones por grado y período académico
export const obtenerSeccionesPorGrado = async (req, res) => {
    const { Cod_grado, Cod_periodo_matricula } = req.params;

    try {
        const [rows] = await pool.query(
            'SELECT Nombre_seccion FROM tbl_secciones WHERE Cod_grado = ? AND Cod_periodo_matricula = ? ORDER BY Nombre_seccion ASC',
            [Cod_grado, Cod_periodo_matricula]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener secciones por grado y período académico:', error);
        res.status(500).json({ mensaje: 'Error al obtener secciones por grado y período académico' });
    }
};

//Actualizar los nombres automaticos
export const generarNombreSeccion = async (req, res) => {
    const { codGrado, anioAcademico } = req.params;

    try {
        // Consulta para obtener el último número de sección generado
        const query = `
            SELECT MAX(CAST(SUBSTRING(Nombre_seccion, 2) AS UNSIGNED)) AS UltimoNumero
            FROM tbl_secciones
            WHERE Cod_grado = ? AND Cod_periodo_matricula = ?;
        `;


        const [rows] = await pool.query(query, [codGrado, anioAcademico]);

        // Obtener el último número y calcular el siguiente
        const ultimoNumero = rows[0]?.UltimoNumero || 0; // Si no hay registros, empieza desde 0
        const nuevoNumero = ultimoNumero + 1;

        // Generar el nuevo nombre de la sección
        const nuevoNombre = `A${nuevoNumero}`;

        res.json({ Nombre_seccion: nuevoNombre });
    } catch (error) {
        console.error('Error al generar el nombre de la sección:', error);
        res.status(500).json({ mensaje: 'Hubo un problema al generar el nombre de la sección.' });
    }
};

// Controlador para obtener todos los profesores
export const obtenerProfesores = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                p.Cod_profesor,
                CONCAT(
                    per.Nombre, ' ',
                    IFNULL(per.Segundo_nombre, ''), ' ',
                    per.Primer_apellido, ' ',
                    IFNULL(per.Segundo_apellido, '')
                ) AS Nombre_completo,
                per.dni_persona AS Numero_identidad
            FROM tbl_profesores p
            JOIN tbl_personas per ON p.Cod_persona = per.Cod_persona
        `);

        res.json(rows);
    } catch (error) {
        console.error('Error al obtener profesores:', error);
        res.status(500).json({ mensaje: 'Error al obtener profesores' });
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

// Controlador para crear una nueva sección
export const crearSeccion = async (req, res) => {
    const { p_Cod_aula, p_Cod_grado, p_Cod_Profesor, p_Cod_periodo_matricula } = req.body;

    // Validar los datos obligatorios
    if (!p_Cod_aula || !p_Cod_grado || !p_Cod_Profesor || !p_Cod_periodo_matricula) {
        return res.status(400).json({ mensaje: 'Todos los campos son requeridos.' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Paso 1: Llamar al procedimiento almacenado para insertar en tbl_secciones
        const [result] = await connection.query(
            'CALL sp_insertar_secciones(?, ?, ?, ?)',
            [p_Cod_aula, p_Cod_grado, p_Cod_Profesor, p_Cod_periodo_matricula]
        );
        
        console.log('Resultado del procedimiento almacenado:', result);
        
        // Verifica cómo se estructura el resultado
        const Cod_secciones = result[0]?.[0]?.Cod_secciones;
        if (!Cod_secciones) {
            throw new Error('No se pudo obtener el ID de la sección creada. Verifica el procedimiento almacenado.');
        }
        

        console.log('ID de la sección creada:', Cod_secciones);

        // Paso 2: Consultar las asignaturas del grado en tbl_grados_asignaturas
        const [asignaturas] = await connection.query(
            'SELECT Cod_grados_asignaturas FROM tbl_grados_asignaturas WHERE Cod_grado = ?',
            [p_Cod_grado]
        );

        if (!asignaturas.length) {
            throw new Error('No se encontraron asignaturas asociadas al grado.');
        }

        // Paso 3: Insertar en tbl_secciones_asignaturas
        const seccionesAsignaturasValues = asignaturas.map(asignatura => [
            Cod_secciones,
            null, // Hora_inicio
            null, // Hora_fin
            asignatura.Cod_grados_asignaturas,
            null, // Dias_nombres
        ]);

        console.log('Valores para insertar en secciones_asignaturas:', seccionesAsignaturasValues);

        await connection.query(
            'INSERT INTO tbl_secciones_asignaturas (Cod_secciones, Hora_inicio, Hora_fin, Cod_grados_asignaturas, Dias_nombres) VALUES ?',
            [seccionesAsignaturasValues]
        );

        await connection.commit();

        res.status(201).json({
            mensaje: 'Sección creada correctamente con asignaturas vinculadas.',
            Cod_secciones,
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error al crear la sección y vincular asignaturas:', error);
        res.status(500).json({
            mensaje: 'Error en el servidor',
            error: error.sqlMessage || error.message,
        });
    } finally {
        connection.release();
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