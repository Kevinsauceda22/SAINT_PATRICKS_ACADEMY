import conectarDB from '../../../config/db.js';
const pool = await conectarDB();

// Controlador para obtener detalles de una sección de asignatura específica o todas las secciones
export const obtenerDetalleSeccionAsignatura = async (req, res) => {
    const { Cod_seccion_asignatura } = req.params; // Extraemos el parámetro de la URL

    try {
        // Llamada al procedimiento almacenado con el parámetro Cod_seccion_asignatura
        let query = 'CALL sp_obtener_detalle_seccion_asignatura(?)';
        
        // Pasamos el parámetro, si no está definido, se envía 0 para obtener todos los detalles
        let params = [Cod_seccion_asignatura ? Cod_seccion_asignatura : 0];

        // Ejecutamos el procedimiento almacenado
        const [rows] = await pool.query(query, params);

        // Verificamos si hay resultados
        if (!rows || rows[0].length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron detalles para la sección de asignatura especificada.' });
        }

        // Devolvemos los detalles de la sección o de todas las secciones, según el parámetro
        res.status(200).json(rows[0]); // Devuelve la primera tabla resultante del procedimiento
    } catch (error) {
        console.error('Error al obtener detalles de la sección de asignatura:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
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
        res.status(500).json({ mensaje: 'Error al obtener dias' });
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

export const crearHorarioSeccionAsignatura = async (req, res) => {
    const { p_Cod_grados_asignaturas, p_Cod_secciones, p_Cod_dias, p_Hora_inicio, p_Hora_fin } = req.body;

    try {
        // Validación de campos requeridos
        if (!p_Cod_grados_asignaturas || !p_Cod_secciones || !p_Cod_dias || !p_Hora_inicio || !p_Hora_fin) {
            return res.status(400).json({ mensaje: "Todos los campos son requeridos." });
        }

        // Llamada al procedimiento almacenado para insertar el horario
        const [result] = await pool.query(
            'CALL sp_insertar_seccion_asignatura(?, ?, ?, ?, ?)',
            [p_Cod_grados_asignaturas, p_Cod_secciones, p_Cod_dias, p_Hora_inicio, p_Hora_fin]
        );

        // Respuesta exitosa
        return res.status(201).json({ mensaje: "Horario de sección asignatura insertado con éxito", data: result });
    } catch (error) {
        console.error('Error al insertar el horario de la sección asignatura:', error);

        // Revisar si el error tiene una propiedad `sqlState` o `sqlMessage`
        if (error.code === 'ER_SIGNAL_EXCEPTION') {
            // Si es un error de SQL que fue lanzado por SIGNAL, manejamos el mensaje de la base de datos
            return res.status(400).json({ mensaje: error.sqlMessage });
        }

        // Si no es un error específico de SIGNAL, manejar otros errores
        return res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};


// Controlador para actualizar una sección asignatura
export const actualizarSeccionAsignatura = async (req, res) => {
    const { 
        p_Cod_seccion_asignatura, 
        p_Cod_secciones, 
        p_Hora_inicio, 
        p_Hora_fin, 
        p_Cod_grados_asignaturas, 
        p_Cod_dias 
    } = req.body;

    try {
        // Validación de campos requeridos
        if (!p_Cod_seccion_asignatura || !p_Cod_secciones || !p_Hora_inicio || !p_Hora_fin || !p_Cod_grados_asignaturas || !p_Cod_dias) {
            return res.status(400).json({ mensaje: "Todos los campos son requeridos." });
        }

        // Validación para asegurar que el horario de inicio sea menor que el horario de fin
        if (p_Hora_inicio >= p_Hora_fin) {
            return res.status(400).json({ mensaje: "La hora de inicio debe ser menor a la hora de fin." });
        }

       // Convertir p_Cod_dias a un arreglo si es una cadena separada por comas
            let diasArray = [];
            if (typeof p_Cod_dias === 'string') {
                diasArray = p_Cod_dias.split(',').map(Number); // Convierte la cadena en un arreglo de números
            } else if (Array.isArray(p_Cod_dias)) {
                diasArray = p_Cod_dias; // Si ya es un arreglo, lo utilizamos directamente
            }

            console.log('Arreglo de días procesado:', diasArray);

        // Llamada al procedimiento almacenado para actualizar la sección asignatura
        const [result] = await pool.query(
            'CALL sp_actualizar_secciones_asignaturas(?, ?, ?, ?, ?, ?)',
            [p_Cod_seccion_asignatura, p_Cod_secciones, p_Hora_inicio, p_Hora_fin, p_Cod_grados_asignaturas, p_Cod_dias]
        );

        return res.status(200).json({ mensaje: 'Sección asignatura actualizada correctamente.', data: result });
    } catch (error) {
        console.error('Error al actualizar la sección asignatura:', error);
        if (error.sqlState === '45000') {
            return res.status(400).json({ mensaje: error.message });
        }
        return res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};
export const obtenerAsignaturasyHorarios = async (req, res) => {
    const { cod_seccion } = req.params; // Obtener el parámetro cod_seccion desde la URL

    console.log("cod_seccion recibido:", cod_seccion);

    // Validar que el parámetro esté presente
    if (!cod_seccion) {
        return res.status(400).json({ mensaje: "El código de la sección es requerido." });
    }

    try {
        // Consulta SQL para obtener asignaturas, horarios y datos de la sección
        const query = `
            SELECT 
                sa.Cod_seccion_asignatura, -- Incluimos el Cod_seccion_asignatura
                s.Cod_secciones,           -- Incluimos el Cod_secciones
                a.Cod_asignatura,
                a.Nombre_asignatura,
                g.Nombre_grado,
                s.Nombre_seccion,
                sa.Hora_inicio,
                sa.Hora_fin,
                GROUP_CONCAT(DISTINCT d.prefijo_dia ORDER BY d.Cod_dias SEPARATOR ', ') AS dias
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
            WHERE 
                s.Cod_secciones = ? -- Filtrar por el código de la sección indicado
                AND ga.Cod_grado = s.Cod_grado -- Validar que el grado coincida
            GROUP BY 
                sa.Cod_seccion_asignatura, -- Agregar al GROUP BY para evitar errores de agrupación
                s.Cod_secciones,           -- Agregar al GROUP BY
                a.Cod_asignatura, 
                a.Nombre_asignatura, 
                g.Nombre_grado, 
                s.Nombre_seccion, 
                sa.Hora_inicio, 
                sa.Hora_fin;
        `;

        // Ejecutar la consulta
        const [rows] = await pool.query(query, [cod_seccion]);

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

// Controlador para obtener secciones de un grado específico
export const obtenerSeccionesPorGrado = async (req, res) => {
    const { Cod_grado } = req.params; // Obtener el parámetro Cod_grado de la URL

    console.log("Cod_grado recibido:", Cod_grado);

    // Verificar que el parámetro esté presente
    if (!Cod_grado) {
        return res.status(400).json({ mensaje: "El código del grado es requerido." });
    }

    try {
        // Consulta SQL para obtener las secciones asociadas al grado
        const query = `
            SELECT 
                s.Cod_secciones,
                s.Nombre_seccion,
                g.Cod_grado,
                g.Nombre_grado
            FROM 
                tbl_secciones s
            JOIN 
                tbl_grados g ON s.Cod_grado = g.Cod_grado
            WHERE 
                g.Cod_grado = ?; -- Filtrar por el código del grado
        `;

        // Ejecutar la consulta
        const [rows] = await pool.query(query, [Cod_grado]);

        console.log("Resultado de la consulta:", rows);

        // Si no se encuentran resultados, devolver un mensaje informativo
        if (rows.length === 0) {
            return res.status(404).json({ mensaje: "No se encontraron secciones para el grado proporcionado." });
        }

        // Responder con los datos obtenidos
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error en la consulta:", error);
        res.status(500).json({ mensaje: "Error al obtener las secciones.", error });
    }
};
export const getDetalleSeccionAsignatura = async (req, res) => {
    const { Cod_seccion_asignatura } = req.params;
    console.log('Parámetro recibido:', Cod_seccion_asignatura); // Log para verificar el parámetro

    try {
        // Consulta que incluye los nombres relacionados
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
            WHERE sa.Cod_seccion_asignatura = ?`;

        const [resultado] = await pool.query(query, [Cod_seccion_asignatura]);

        console.log('Resultado de la consulta:', resultado); // Log para depurar el resultado de la consulta

        if (resultado.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron datos para la sección asignatura proporcionada' });
        }

        res.json(resultado[0]); // Devuelve los datos de la sección asignatura encontrada
    } catch (error) {
        console.error('Error al obtener datos de la sección asignatura:', error.message); // Log detallado del error
        res.status(500).json({ mensaje: 'Error al obtener los datos de la sección asignatura' });
    }
};

export const obtenerAsignaturasPorProfesor = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ mensaje: 'Token no proporcionado' });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const codPersona = decodedToken.cod_persona;
        if (!codPersona) {
            return res.status(400).json({ mensaje: 'El token no contiene cod_persona' });
        }

        const [profesorResult] = await pool.query(
            'SELECT Cod_Profesor FROM tbl_profesores WHERE Cod_Persona = ?',
            [codPersona]
        );

        if (profesorResult.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontró un profesor con este cod_persona' });
        }

        const codProfesor = profesorResult[0].Cod_Profesor;

        // Asegúrate de obtener `Cod_secciones` del cliente
        const { codSeccion } = req.params; // `codSeccion` debería ser el nombre correcto del parámetro

        // Llama al procedimiento almacenado con ambos parámetros
        const [asignaturas] = await pool.query('CALL ObtenerAsignaturasPorProfesor(?, ?)', [codProfesor, codSeccion]);

        if (!asignaturas || asignaturas.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron asignaturas para esta sección' });
        }

        res.status(200).json(asignaturas[0]); // Devuelve el resultado correcto
    } catch (error) {
        console.error('Error al obtener las asignaturas:', error);
        res.status(500).json({ mensaje: 'Error al obtener las asignaturas' });
    }
};


export const obtenerAsignaturasPorSeccion = async (req, res) => {
    try {
        const { codSeccion } = req.params;

        if (!codSeccion) {
            return res.status(400).json({ mensaje: 'Cod_seccion es requerido' });
        }

        // Llama al procedimiento almacenado con el parámetro adecuado
        const [asignaturas] = await pool.query('CALL getAsignaturasPorSeccion(?)', [codSeccion]);

        if (!asignaturas[0] || asignaturas[0].length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron asignaturas para esta sección' });
        }

        res.status(200).json(asignaturas[0]); // Devuelve los resultados
    } catch (error) {
        console.error('Error al obtener las asignaturas de la sección:', error);
        res.status(500).json({ mensaje: 'Error al obtener las asignaturas de la sección' });
    }
};




  
