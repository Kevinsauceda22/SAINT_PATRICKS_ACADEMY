import conectarDB from '../../../config/db.js';
import jwt from 'jsonwebtoken';
const pool = await conectarDB();

// Controlador para obtener detalles de una sección asignatura específica
export const obtenerDetalleSeccionAsignatura = async (req, res) => {
    const { Cod_seccion_asignatura } = req.params;

    try {
        // Llamada al procedimiento almacenado
        const query = `CALL sp_obtener_detalle_seccion_asignatura(?);`;
        const [resultado] = await pool.query(query, [Cod_seccion_asignatura]);

        if (!resultado || !resultado[0]) {
            return res.status(404).json({ mensaje: 'No se encontraron datos para la sección asignatura proporcionada' });
        }

        // Verificación de los datos obtenidos
        console.log("Resultado del procedimiento almacenado:", resultado[0]);

        // Si el resultado no contiene días, deberíamos revisar qué está pasando en la respuesta
        if (!resultado[0][0].Nombre_dia) {
            console.error('Días no encontrados en el resultado:', resultado[0]);
        }

        res.json(resultado[0][0]);
    } catch (error) {
        console.error('Error al obtener datos de la sección asignatura:', error.message);
        res.status(500).json({ mensaje: 'Error al obtener los datos de la sección asignatura' });
    }
};

// Controlador para obtener las secciones filtradas por Cod_grado y Cod_periodo_matricula
export const obtenerSecciones = async (req, res) => {
    const { Cod_grado, Cod_periodo_matricula } = req.params; // Cambiado a req.params

    try {
        // Validar que los parámetros requeridos estén presentes
        if (!Cod_grado || !Cod_periodo_matricula) {
            return res.status(400).json({ 
                mensaje: "Los parámetros 'Cod_grado' y 'Cod_periodo_matricula' son requeridos." 
            });
        }

        // Consulta SQL
        const query = `
            SELECT 
                Cod_secciones, 
                Nombre_seccion
            FROM 
                tbl_secciones
            WHERE 
                Cod_grado = ? 
                AND Cod_periodo_matricula = ?;
        `;

        // Ejecutar la consulta con los parámetros proporcionados
        const [rows] = await pool.query(query, [Cod_grado, Cod_periodo_matricula]);

        // Responder con los resultados
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener secciones:', error);
        res.status(500).json({ mensaje: 'Error al obtener secciones' });
    }
};

// Controlador para obtener todos los días
export const obtenerDias = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT Cod_dias, dias, prefijo_dia FROM tbl_dias');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener dias:', error);
        res.status(500).json({ mensaje: 'Error al obtener días' });
    }
};

// Controlador para obtener todos los grados y asignaturas
export const obtenerGradosAsignaturas = async (req, res) => {
    try {
        // Consulta para unir grados y asignaturas desde la tabla intermedia
        const [rows] = await pool.query(`
            SELECT 
                ga.Cod_grados_asignaturas,
                g.Cod_grado,
                g.Nombre_grado,
                a.Cod_asignatura,
                a.Nombre_asignatura
            FROM 
                tbl_grados_asignaturas ga
            INNER JOIN 
                tbl_grados g ON ga.Cod_grado = g.Cod_grado
            INNER JOIN 
                tbl_asignaturas a ON ga.Cod_asignatura = a.Cod_asignatura
        `);

        // Respuesta con los datos obtenidos
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener grados y asignaturas:', error);
        res.status(500).json({ mensaje: 'Error al obtener grados y asignaturas' });
    }
};

// Controlador para actualizar
export const actualizarSeccionAsignatura = async (req, res) => {
    try {
        const {
            p_Cod_seccion_asignatura,
            p_Cod_secciones,
            p_Hora_inicio,
            p_Hora_fin,
            p_Cod_grados_asignaturas,
            p_Cod_dias
        } = req.body;

        // Validación de parámetros
        if (
            !p_Cod_seccion_asignatura ||
            !p_Cod_secciones ||
            !p_Hora_inicio ||
            !p_Hora_fin ||
            !p_Cod_grados_asignaturas ||
            !p_Cod_dias
        ) {
            return res.status(400).json({ mensaje: "Todos los campos son requeridos." });
        }

        // Ejecución del procedimiento almacenado
        const result = await pool.query('CALL sp_actualizar_secciones_asignaturas(?, ?, ?, ?, ?, ?)', [
            p_Cod_seccion_asignatura,
            p_Cod_secciones,
            p_Hora_inicio,
            p_Hora_fin,
            p_Cod_grados_asignaturas,
            p_Cod_dias
        ]);

        // Validación del resultado
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: "El registro no existe." });
        }

        return res.status(200).json({ mensaje: "Sección asignatura actualizada correctamente." });
    } catch (error) {
        console.error(error);

        // Manejo de errores específicos
        if (error.code === 'ER_SIGNAL_EXCEPTION') {
            return res.status(500).json({ mensaje: error.sqlMessage || "Error interno del servidor." });
        }

        // Manejo de errores generales
        return res.status(500).json({ mensaje: "Error al actualizar la sección asignatura." });
    }
};

// Controlador para obtener asignaturas y horarios
export const obtenerAsignaturasyHorarios = async (req, res) => {
    const { cod_seccion } = req.params; // Obtener el parámetro cod_seccion desde la URL

    console.log("cod_seccion recibido:", cod_seccion);

    // Validar que el parámetro esté presente
    if (!cod_seccion) {
        return res.status(400).json({ mensaje: "El código de la sección es requerido." });
    }

    try {
        // Consulta SQL para obtener asignaturas, horarios, datos de la sección y nombre del profesor
        const query = `
                    SELECT 
            sa.Cod_seccion_asignatura,
            s.Cod_secciones,
            a.Cod_asignatura,
            a.Nombre_asignatura,
            g.Nombre_grado,
            s.Nombre_seccion,
            sa.Hora_inicio,
            sa.Hora_fin,
            GROUP_CONCAT(DISTINCT d.prefijo_dia ORDER BY d.Cod_dias SEPARATOR ', ') AS dias,
            CONCAT(p.Nombre, ' ', p.Primer_apellido, ' ', p.Segundo_apellido) AS Nombre_completo
        FROM 
            tbl_secciones s
        JOIN 
            tbl_secciones_asignaturas sa ON sa.Cod_secciones = s.Cod_secciones
        JOIN 
            tbl_grados_asignaturas ga ON sa.Cod_grados_asignaturas = ga.Cod_grados_asignaturas
        JOIN 
            tbl_asignaturas a ON ga.Cod_asignatura = a.Cod_asignatura
        JOIN 
            tbl_grados g ON ga.Cod_grado = g.Cod_grado
        LEFT JOIN 
            tbl_secciones_asignaturas_dias sad ON sa.Cod_seccion_asignatura = sad.Cod_seccion_asignatura
        LEFT JOIN 
            tbl_dias d ON sad.Cod_dias = d.Cod_dias
        LEFT JOIN 
            tbl_profesores prof ON prof.Cod_profesor = s.Cod_profesor -- Relación con profesores
        LEFT JOIN 
            tbl_personas p ON prof.cod_persona = p.cod_persona -- Relación con personas
        WHERE 
            s.Cod_secciones = ?
        GROUP BY 
            sa.Cod_seccion_asignatura, s.Cod_secciones, a.Cod_asignatura, a.Nombre_asignatura, 
            g.Nombre_grado, s.Nombre_seccion, sa.Hora_inicio, sa.Hora_fin, Nombre_completo;
        `;

        // Ejecutar la consulta
        const [rows] = await pool.query(query, [cod_seccion]);
        console.log("Datos devueltos por la consulta SQL:", rows);


        console.log("Resultado de la consulta:", rows);

        // Si no se encuentran resultados, devolver un mensaje informativo
        if (rows.length === 0) {
            return res.status(404).json({ mensaje: "No se encontraron asignaturas para la sección proporcionada." });
        }

        // Responder con los datos obtenidos
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error en la consulta:", error);
        res.status(500).json({ mensaje: "Error al obtener las asignaturas.", error });
    }
};

// Controlador para obtener asignaturas específicas de una sección y grado
export const obtenerAsignaturasPorSeccionYGrado = async (req, res) => {
    try {
        const { Cod_secciones } = req.params; // Obtener el parámetro Cod_secciones

        // Verificar que el parámetro exista
        if (!Cod_secciones) {
            return res.status(400).json({ mensaje: 'El parámetro Cod_secciones es obligatorio' });
        }

        // Consulta SQL para obtener las asignaturas relacionadas con la sección y su grado
        const [rows] = await pool.query(`
            SELECT 
                ga.Cod_grados_asignaturas,
                a.Cod_asignatura,
                a.Nombre_asignatura,
                g.Cod_grado,           -- Incluimos el código del grado
                g.Nombre_grado,        -- Incluimos el nombre del grado
                s.Cod_secciones,       -- Incluimos el código de la sección
                s.Nombre_seccion       -- Incluimos el nombre de la sección
            FROM 
                tbl_grados_asignaturas ga
            INNER JOIN 
                tbl_asignaturas a ON ga.Cod_asignatura = a.Cod_asignatura
            INNER JOIN 
                tbl_grados g ON ga.Cod_grado = g.Cod_grado
            INNER JOIN 
                tbl_secciones s ON g.Cod_grado = s.Cod_grado
            WHERE 
                s.Cod_secciones = ?;
        `, [Cod_secciones]);

        // Si no se encuentran resultados, responder con un mensaje
        if (rows.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron asignaturas para esta sección' });
        }

        // Responder con los datos obtenidos
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener asignaturas por sección y grado:', error);
        res.status(500).json({ mensaje: 'Error al obtener asignaturas por sección y grado' });
    }
};

// Obtener detalles de la seccion
export const getDetalleSeccionAsignatura = async (req, res) => {
    const { Cod_seccion_asignatura } = req.params;

    try {
        const query = `
            SELECT 
                sa.Cod_seccion_asignatura,
                s.Nombre_seccion AS Nombre_seccion,
                sa.Hora_inicio,
                sa.Hora_fin,
                g.Nombre_grado AS Nombre_grado,
                a.Nombre_asignatura AS Nombre_asignatura,
                sa.Dias_nombres
            FROM tbl_secciones_asignaturas sa
            INNER JOIN tbl_secciones s ON sa.Cod_secciones = s.Cod_secciones
            INNER JOIN tbl_grados_asignaturas ga ON sa.Cod_grados_asignaturas = ga.Cod_grados_asignaturas
            INNER JOIN tbl_grados g ON ga.Cod_grado = g.Cod_grado
            INNER JOIN tbl_asignaturas a ON ga.Cod_asignatura = a.Cod_asignatura
            WHERE sa.Cod_seccion_asignatura = ?;
        `;

        const [resultado] = await pool.query(query, [Cod_seccion_asignatura]);

        if (resultado.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron datos para la sección asignatura proporcionada' });
        }

        res.json(resultado[0]);
    } catch (error) {
        console.error('Error al obtener datos de la sección asignatura:', error.message);
        res.status(500).json({ mensaje: 'Error al obtener los datos de la sección asignatura' });
    }
};

export const obtenerAsignaturasPorGradoYSeccion = async (req, res) => {
    const { Cod_seccion } = req.params;

    try {
        const [rows] = await pool.query(
            `SELECT 
                s.Cod_secciones, -- Incluye el código de la sección
                sa.Cod_seccion_asignatura, -- Incluye el código de la sección asignatura
                ga.Cod_grados_asignaturas,
                g.Nombre_grado,
                s.Nombre_seccion,
                a.Nombre_asignatura,
                COALESCE(sa.Hora_inicio, '00:00') AS Hora_inicio,
                COALESCE(sa.Hora_fin, '00:00') AS Hora_fin,
                COALESCE(GROUP_CONCAT(d.prefijo_dia ORDER BY d.prefijo_dia SEPARATOR ', '), 'No asignado') AS Dias_nombres,
                prof.Cod_profesor, -- Incluye el código del profesor
                CONCAT(p.Nombre, ' ', p.Primer_apellido, ' ', p.Segundo_apellido) AS Nombre_profesor -- Nombre completo del profesor
            FROM 
                tbl_secciones s
            JOIN 
                tbl_grados g ON s.Cod_grado = g.Cod_grado
            JOIN 
                tbl_grados_asignaturas ga ON g.Cod_grado = ga.Cod_grado
            JOIN 
                tbl_asignaturas a ON ga.Cod_asignatura = a.Cod_asignatura
            LEFT JOIN 
                tbl_secciones_asignaturas sa ON sa.Cod_grados_asignaturas = ga.Cod_grados_asignaturas
                AND sa.Cod_secciones = s.Cod_secciones
            LEFT JOIN 
                tbl_secciones_asignaturas_dias sad ON sa.Cod_seccion_asignatura = sad.Cod_seccion_asignatura
            LEFT JOIN 
                tbl_dias d ON sad.Cod_dias = d.Cod_dias
            LEFT JOIN 
                tbl_profesores prof ON prof.Cod_profesor = s.Cod_profesor -- Relacionamos la tabla de profesores
            LEFT JOIN 
                tbl_personas p ON prof.Cod_persona = p.Cod_persona -- Relacionamos la tabla de personas para obtener el nombre completo del profesor
            WHERE 
                s.Cod_secciones = ?
            GROUP BY 
                s.Cod_secciones, -- Agregar Cod_secciones al GROUP BY
                sa.Cod_seccion_asignatura, -- Agregar Cod_seccion_asignatura al GROUP BY
                ga.Cod_grados_asignaturas, 
                g.Nombre_grado, 
                s.Nombre_seccion, 
                a.Nombre_asignatura, 
                sa.Hora_inicio, 
                sa.Hora_fin,
                prof.Cod_profesor, -- Incluimos el Cod_profesor en el GROUP BY
                p.Nombre, p.Primer_apellido, p.Segundo_apellido; -- Incluimos las columnas necesarias para el nombre completo del profesor


            `,
            [Cod_seccion]
        );

        res.status(200).json(rows);
    } catch (error) {
        console.error("Error al obtener asignaturas por grado y sección:", error);
        res.status(500).json({ 
            mensaje: "Error al obtener asignaturas por grado y sección.", 
            error: error.message 
        });
    }
};