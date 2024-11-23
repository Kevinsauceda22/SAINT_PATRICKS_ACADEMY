// Importar la conexión a la base de datos
import conectarDB from '../../../config/db.js';
const pool = await conectarDB(); // Establecer el pool de conexiones
import jwt from 'jsonwebtoken';

// Controlador para obtener todas las secciones
export const get_seccionesP = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL get_seccionesP()'); // Llamar al procedimiento almacenado
        res.json(rows[0]); // Devolver el primer conjunto de resultados
    } catch (error) {
        console.error('Error al obtener las secciones:', error);
        res.status(500).json({ message: error.message }); // Manejo de errores
    }
};

// Controlador para crear una nueva sección
export const createSeccion = async (req, res) => {
    const { Nombre_seccion } = req.body; // Obtener el nombre de la sección del cuerpo de la solicitud
    try {
        const [result] = await pool.query('CALL create_seccion(?)', [Nombre_seccion]); // Llamar al procedimiento almacenado
        res.json({ message: 'Sección creada correctamente', id: result.insertId }); // Devolver el ID de la nueva sección
    } catch (error) {
        console.error('Error al crear la sección:', error);
        res.status(500).json({ message: error.message }); // Manejo de errores
    }
};

// Controlador para actualizar una sección existente
export const updateSeccion = async (req, res) => {
    const { id } = req.params; // Obtener el ID de la sección desde los parámetros de la ruta
    const { Nombre_seccion } = req.body; // Obtener el nuevo nombre de la sección del cuerpo de la solicitud
    try {
        await pool.query('CALL update_seccion(?, ?)', [id, Nombre_seccion]); // Llamar al procedimiento almacenado
        res.json({ message: 'Sección actualizada correctamente' }); // Confirmar la actualización
    } catch (error) {
        console.error('Error al actualizar la sección:', error);
        res.status(500).json({ message: error.message }); // Manejo de errores
    }
};

// Controlador para eliminar una sección
export const deleteSeccion = async (req, res) => {
    const { id } = req.params; // Obtener el ID de la sección desde los parámetros de la ruta
    try {
        await pool.query('CALL delete_seccion(?)', [id]); // Llamar al procedimiento almacenado
        res.json({ message: 'Sección eliminada correctamente' }); // Confirmar la eliminación
    } catch (error) {
        console.error('Error al eliminar la sección:', error);
        res.status(500).json({ message: error.message }); // Manejo de errores
    }
};





// Controlador para obtener las secciones filtradas por el profesor
// Obtener las secciones de un profesor con nombres de grado y período
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
       

        // Obtener las secciones del profesor
        const [secciones] = await pool.query(
            'SELECT Cod_secciones, Nombre_seccion, Cod_aula, Cod_grado, Cod_periodo_matricula FROM tbl_secciones WHERE Cod_Profesor = ?',
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
  
  
  
  
  
  