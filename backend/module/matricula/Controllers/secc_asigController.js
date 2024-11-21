import conectarDB from '../../../config/db.js';
import jwt from 'jsonwebtoken';
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

// Controlador para obtener todas las secciones
export const obtenerSecciones = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT Cod_secciones, Nombre_seccion FROM tbl_secciones');
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
