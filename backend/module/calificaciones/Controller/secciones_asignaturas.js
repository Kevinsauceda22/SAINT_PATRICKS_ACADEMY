import conectarDB from '../../../config/db.js';
import jwt from 'jsonwebtoken';
const pool = await conectarDB();


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

// Controlador para obtener las secciones filtradas por el profesor

export const obtenerSeccionesPorProfesor = async (req, res) => {
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

        // Consulta para obtener el cod_profesor utilizando cod_persona
        const [profesorResult] = await pool.query(
            'SELECT Cod_Profesor FROM tbl_profesores WHERE Cod_Persona = ?',
            [codPersona]
        );

        if (profesorResult.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontró un profesor con este cod_persona' });
        }

        const codProfesor = profesorResult[0].Cod_Profesor;
       

        // Obtener las secciones del profesor con nombre de grado y año académico, ordenadas
        const [secciones] = await pool.query(
        `SELECT 
            s.Cod_secciones, 
            s.Nombre_seccion, 
            s.Cod_aula, 
            s.Cod_grado, 
            s.Cod_periodo_matricula,
            g.Nombre_grado,
            p.Anio_academico
            FROM tbl_secciones s
            JOIN tbl_grados g ON s.Cod_grado = g.Cod_grado
            JOIN tbl_periodo_matricula p ON s.Cod_periodo_matricula = p.Cod_periodo_matricula
            WHERE s.Cod_Profesor = ?
            ORDER BY p.Anio_academico DESC, g.Nombre_grado ASC`,
        [codProfesor]
        );


        // Obtener los nombres de grado y período para cada sección
        for (let seccion of secciones) {
            // Consulta para obtener el nombre del grado
            const [gradoResult] = await pool.query(
                'SELECT Nombre_grado FROM tbl_grados WHERE Cod_grado = ?',
                [seccion.Cod_grado]
                
            );



            
            // Consulta para obtener el nombre del período
            const [periodoResult] = await pool.query(
                'SELECT Anio_academico FROM tbl_periodo_matricula WHERE Cod_periodo_matricula = ?',
                [seccion.Cod_periodo_matricula]
            );

            // Añadir los nombres a la sección
            seccion.Nombre_grado = gradoResult.length > 0 ? gradoResult[0].Nombre_grado : 'Sin nombre';
            seccion.Anio_academico = periodoResult.length > 0 ? periodoResult[0].Anio_academico : 'Sin nombre';
        }

        // Enviar las secciones con los nombres completos y el código del profesor
        res.status(200).json({
            codProfesor, // Código del profesor
            secciones,   // Lista de secciones
        });
    } catch (error) {
        console.error('Error al obtener las secciones:', error);
        res.status(500).json({ mensaje: 'Error al obtener las secciones' });
    }
};





// Nueva función para obtener todas las secciones y profesores para el administrador


export const obtenerTodasLasSeccionesYProfesoresAdmin = async (req, res) => {
    try {
      const { codProfesor } = req.params; // Obtener `Cod_Profesor` desde los parámetros de la URL
      if (!codProfesor) {
        return res.status(400).json({ mensaje: 'Cod_Profesor es requerido' });
      }
  
      // Llamar al procedimiento almacenado `getSeccionesPorProfesor`
      const [secciones] = await pool.query('CALL getSeccionesPorProfesor(?)', [codProfesor]);
  
      console.log(`Secciones obtenidas para Cod_Profesor ${codProfesor}:`, secciones[0]);
  
      res.status(200).json(secciones[0]); // Devolver las secciones con los datos completos
    } catch (error) {
      console.error('Error al obtener las secciones del profesor:', error);
      res.status(500).json({ mensaje: 'Error al obtener las secciones del profesor' });
    }
  };
  