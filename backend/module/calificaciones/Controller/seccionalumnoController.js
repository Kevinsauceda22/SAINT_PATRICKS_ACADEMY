import conectarDB from '../../../config/db.js';
const pool = await conectarDB();
import jwt from 'jsonwebtoken';

// Controlador para obtener todas las secciones
export const obtenerSecciones = async (req, res) => {
    try {
        const query = `CALL get_Secciones();`;
        const [results] = await pool.query(query);

        if (results.length === 0 || results[0].length === 0) {
            return res.status(404).json({ message: 'No se encontraron secciones' });
        }

        res.status(200).json(results[0]); // Accedemos al primer conjunto de resultados
    } catch (error) {
        console.error('Error al obtener las secciones:', error);
        res.status(500).json({ message: 'Error al obtener las secciones', error });
    }
};

export const obtenerSeccionesPorProfesor = async (req, res) => {
    try {
        // Verifica que el token esté presente en el encabezado
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ mensaje: 'Token no proporcionado' });
        }

        // Decodifica el token para obtener el cod_persona
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const codPersona = decodedToken.cod_persona;

        if (!codPersona) {
            return res.status(400).json({ mensaje: 'El token no contiene cod_persona' });
        }

        // Llama al procedimiento almacenado con el cod_persona
        const [secciones] = await pool.query('CALL get_SeccionesProfe(?)', [codPersona]);

        // Si el resultado está vacío, retorna un mensaje
        if (!secciones || secciones.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron secciones para este profesor' });
        }

        // Envía las secciones obtenidas como respuesta
        return res.status(200).json({
            secciones: secciones[0], // Asegúrate de que este nivel de datos sea correcto
        });
    } catch (error) {
        console.error('Error al obtener las secciones:', error.message, error.stack);
        res.status(500).json({ mensaje: 'Error al obtener las secciones' });
    }
};



export const obtenerNomenclaturaPorSeccion = async (req, res) => {
    const { codSeccion } = req.query; // Obtener el código de la sección desde los parámetros de la query

    if (!codSeccion) {
        return res.status(400).json({ message: 'Falta el parámetro Cod_seccion' });
    }

    try {
        // Consulta SQL para obtener la nomenclatura de una sección específica
        const query = `
            SELECT DISTINCT 
                s.Cod_secciones AS Cod_seccion, 
                CONCAT(g.Nombre_grado, ' - ', s.Nombre_seccion, ' - ', YEAR(m.Fecha_matricula)) AS Nomenclatura
            FROM 
                tbl_secciones_matricula sm
            JOIN 
                tbl_secciones s ON sm.Cod_seccion = s.Cod_secciones
            JOIN 
                tbl_grados g ON sm.Cod_grado = g.Cod_grado
            JOIN 
                tbl_matricula m ON sm.Cod_matricula = m.Cod_matricula
            WHERE 
                s.Cod_secciones = ?;
        `;
        
        // Ejecutar la consulta con el código de sección proporcionado
        const [results] = await pool.query(query, [codSeccion]);

        if (results.length === 0) {
            return res.status(404).json({ message: 'No se encontró la nomenclatura para la sección seleccionada.' });
        }

        res.status(200).json(results[0]); // Enviar la nomenclatura de la sección
    } catch (error) {
        console.error('Error al obtener la nomenclatura:', error);
        res.status(500).json({ message: 'Error al obtener la nomenclatura', error });
    }
};


// Controlador para obtener estudiantes de una sección específica
export const obtenerEstudiantesPorSeccion = async (req, res) => {
    const { id } = req.params; // Obtiene el ID de la sección desde los parámetros de la ruta

    try {
        const query = `CALL get_EstudiantesPorSeccion(?);`;
        const [results] = await pool.query(query, [id]);

        if (results.length === 0 || results[0].length === 0) {
            return res.status(404).json({ message: 'No se encontraron estudiantes en esta sección' });
        }

        res.status(200).json(results[0]); // Accedemos al primer conjunto de resultados
    } catch (error) {
        console.error('Error al obtener los estudiantes:', error);
        res.status(500).json({ message: 'Error al obtener los estudiantes', error });
    }
};
