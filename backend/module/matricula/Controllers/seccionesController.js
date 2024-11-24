import conectarDB from '../../../config/db.js';
const pool = await conectarDB();

// Controlador para obtener las secciones
export const obtenerSecciones = async (req, res) => {
    try {
        // Obtenemos el parámetro 'Cod_secciones' de la solicitud
        const { Cod_secciones } = req.params;

        // Llamamos al procedimiento almacenado con el parámetro
        const [rows] = await pool.query('CALL sp_obtener_secciones(?)', [Cod_secciones]);

        // Verificamos si se encontraron resultados
        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'No se encontraron secciones' });
        }
    } catch (error) {
        console.error('Error al obtener las secciones:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// NUEVO Controlador para obtener el período académico activo
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
    const { p_Nombre_seccion, p_Cod_aula, p_Cod_grado, p_Cod_Profesor, p_Anio_academico } = req.body;

    try {
        // Validación de campos requeridos
        if (!p_Nombre_seccion || !p_Cod_aula || !p_Cod_grado || !p_Cod_Profesor || !p_Anio_academico) {
            return res.status(400).json({ mensaje: "Todos los campos son requeridos." });
        }

        // Buscar el Cod_periodo_matricula correspondiente al Anio_academico
        const [periodo] = await pool.query(
            'SELECT Cod_periodo_matricula FROM tbl_periodo_matricula WHERE Anio_academico = ? AND estado = "activo"',
            [p_Anio_academico]
        );

        // Validar que el período académico activo exista
        if (!periodo.length) {
            return res.status(404).json({
                mensaje: `No se encontró un período activo para el año académico ${p_Anio_academico}.`,
            });
        }

        const p_Cod_periodo_matricula = periodo[0].Cod_periodo_matricula;

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



