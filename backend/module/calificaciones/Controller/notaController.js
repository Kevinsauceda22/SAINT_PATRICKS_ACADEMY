import conectarDB from '../../../config/db.js';
const pool = await conectarDB();
import jwt from 'jsonwebtoken';

// Obtener todas las notas
export const obtenerSeccion = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL get_all_secciones()');
        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron notas' });
        }
    } catch (error) {
        console.error('Error al obtener las notas:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
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
        const [secciones] = await pool.query('CALL get_all_notas(?)', [codPersona]);

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

// Obtener el conteo de parciales por sección
export const ObtenerPromedioParcialesPorSeccion = async (req, res) => {
    const { Cod_seccion } = req.query;

    // Validar si el parámetro Cod_seccion fue proporcionado
    if (!Cod_seccion) {
        return res.status(400).json({ Mensaje: 'El parámetro Cod_seccion es requerido' });
    }

    try {
        // Ejecutar el procedimiento almacenado con el parámetro proporcionado
        const [results] = await pool.query('CALL ObtenerPromedioParcialesPorSeccion(?)', [Cod_seccion]);

        // Devolver los resultados
        res.status(200).json(results[0]);
    } catch (error) {
        console.error('Error al obtener el conteo de parciales:', error);

        if (error.code === 'ER_SIGNAL_EXCEPTION') {
            res.status(400).json({ Mensaje: error.sqlMessage });
        } else {
            res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
        }
    }
};

// Obtener el conteo de parciales por sección
export const obtenerpromedionotas = async (req, res) => {
    const { Cod_seccion_asignatura } = req.query;

    // Validar si el parámetro Cod_seccion_asignatura fue proporcionado
    if (!Cod_seccion_asignatura) {
        return res.status(400).json({ Mensaje: 'El parámetro Cod_seccion_asignatura es requerido' });
    }

    try {
        // Ejecutar el procedimiento almacenado con el parámetro proporcionado
        const [results] = await pool.query('CALL CalcularPromedioPorParcial(?)', [Cod_seccion_asignatura]);

        // Devolver los resultados
        res.status(200).json(results[0]);
    } catch (error) {
        console.error('Error al obtener el promedio:', error);

        if (error.code === 'ER_SIGNAL_EXCEPTION') {
            res.status(400).json({ Mensaje: error.sqlMessage });
        } else {
            res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
        }
    }
};

// Obtener el conteo de parciales por sección
export const ObtenerActividadesPorAsignatura = async (req, res) => {
    const { Cod_seccion_asignatura } = req.query;

    // Validar si el parámetro Cod_seccion_asignatura fue proporcionado
    if (!Cod_seccion_asignatura) {
        return res.status(400).json({ Mensaje: 'El parámetro Cod_seccion_asignatura es requerido' });
    }

    try {
        // Ejecutar el procedimiento almacenado con el parámetro proporcionado
        const [results] = await pool.query('CALL ObtenerActividadesPorAsignatura(?)', [Cod_seccion_asignatura]);

        // Devolver los resultados
        res.status(200).json(results[0]);
    } catch (error) {
        console.error('Error al obtener el la actividad:', error);

        if (error.code === 'ER_SIGNAL_EXCEPTION') {
            res.status(400).json({ Mensaje: error.sqlMessage });
        } else {
            res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
        }
    }
};

// Obtener el conteo de parciales por sección
export const ObtenerActividadesPorAsignaturaCalificadas = async (req, res) => {
    const { Cod_seccion_asignatura } = req.query;

    // Validar si el parámetro Cod_seccion_asignatura fue proporcionado
    if (!Cod_seccion_asignatura) {
        return res.status(400).json({ Mensaje: 'El parámetro Cod_seccion_asignatura es requerido' });
    }

    try {
        // Ejecutar el procedimiento almacenado con el parámetro proporcionado
        const [results] = await pool.query('CALL ObtenerActividadesCalificadas(?)', [Cod_seccion_asignatura]);

        // Devolver los resultados
        res.status(200).json(results[0]);
    } catch (error) {
        console.error('Error al obtener el la actividad:', error);

        if (error.code === 'ER_SIGNAL_EXCEPTION') {
            res.status(400).json({ Mensaje: error.sqlMessage });
        } else {
            res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
        }
    }
};


// Crear múltiples notas
export const crearNota = async (req, res) => {
    const notas = req.body; // Array de notas
    try {
        const resultados = [];
        for (const nota of notas) {
            const { Nota, Observacion, Cod_parcial, Cod_actividad_asignatura, Cod_seccion_matricula } = nota;
            try {
                await pool.query('CALL insert_nota(?,?,?,?,?)', [
                    Nota,
                    Observacion,
                    Cod_parcial,
                    Cod_actividad_asignatura,
                    Cod_seccion_matricula,
                ]);
                resultados.push({ Mensaje: `Nota para Cod_seccion_matricula ${Cod_seccion_matricula} agregada exitosamente` });
            } catch (error) {
                console.error('Error al agregar nota:', error);
                resultados.push({
                    Cod_seccion_matricula,
                    Error: error.code === 'ER_SIGNAL_EXCEPTION' ? error.sqlMessage : 'Error desconocido',
                });
            }
        }
        res.status(201).json({ Resultados: resultados });
    } catch (error) {
        console.error('Error general al agregar notas:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};


// Actualizar una nota
export const actualizarNota = async (req, res) => {
    const datos = req.body; // Recibe el array de datos enviados desde el frontend

    if (!Array.isArray(datos) || datos.length === 0) {
        return res.status(400).json({ Mensaje: 'No hay datos para actualizar.' });
    }

    try {
        for (const nota of datos) {
            const { Cod_nota, Nota, Observacion } = nota;

            // Validar que los campos necesarios estén presentes
            if (!Cod_nota || Nota === undefined) {
                return res.status(400).json({ Mensaje: 'Datos incompletos para la actualización.' });
            }

            // Llamar al procedimiento almacenado para cada nota
            await pool.query('CALL update_nota(?, ?, ?)', [Cod_nota, Nota, Observacion]);
        }

        res.status(200).json({ Mensaje: 'Notas actualizadas exitosamente' });
    } catch (error) {
        console.error('Error al actualizar notas:', error);

        // Manejo de errores del procedimiento almacenado
        if (error.code === 'ER_SIGNAL_EXCEPTION') {
            res.status(400).json({ Mensaje: error.sqlMessage }); // Mensaje desde el procedimiento
        } else {
            res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
        }
    }
};


export const obtenerEstudiantesConTotal = async (req, res) => {
    const { Cod_seccion, Cod_seccion_asignatura, Cod_parcial } = req.params;
  
    try {
      const query = `CALL ObtenerEstudiantesConNotas(?, ?, ?);`;
      const [results] = await pool.query(query, [
        Cod_seccion,
        Cod_seccion_asignatura,
        Cod_parcial,
      ]);
  
      if (results.length === 0 || results[0].length === 0) {
        return res.status(404).json({
          message: "No se encontraron estudiantes para la combinación proporcionada",
        });
      }
  
      res.status(200).json(results[0]);
    } catch (error) {
      console.error("Error al obtener los estudiantes:", error);
      res.status(500).json({
        message: "Error al obtener los estudiantes",
        error,
      });
    }
  };
  

  export const obtenerNotasParaEdicion = async (req, res) => {
    const { Cod_seccion, Cod_seccion_asignatura, Cod_parcial } = req.query;
  
    // Validar si los parámetros necesarios fueron proporcionados
    if (!Cod_seccion || !Cod_seccion_asignatura || !Cod_parcial) {
      return res.status(400).json({ 
        Mensaje: 'Se requieren los parámetros Cod_seccion, Cod_seccion_asignatura y Cod_parcial'
      });
    }
  
    try {
      // Ejecutar el procedimiento almacenado
      const query = `CALL ObtenerNotas(?, ?, ?);`;
      const [results] = await pool.query(query, [
        Cod_seccion,
        Cod_seccion_asignatura,
        Cod_parcial,
      ]);
  
      // Validar si se obtuvieron resultados
      if (results.length === 0 || results[0].length === 0) {
        return res.status(404).json({
          Mensaje: 'No se encontraron notas para los criterios proporcionados',
        });
      }
  
      // Enviar los datos de las notas como respuesta
      res.status(200).json(results[0]);
    } catch (error) {
      console.error('Error al obtener las notas:', error);
      res.status(500).json({
        Mensaje: 'Error al obtener las notas',
        error: error.message,
      });
    }
  };
  
  // Controlador para obtener notas de estudiantes de una actividad en una sección específica
export const obtenerNotasPorActividad = async (req, res) => {
    const { codSeccion, codSeccionAsignatura, codParcial, codActividadAsignatura } = req.params; // Obtiene los parámetros desde la ruta

    try {
        const query = `CALL ObtenerNotasModal(?, ?, ?, ?);`;
        const [results] = await pool.query(query, [codSeccion, codSeccionAsignatura, codParcial, codActividadAsignatura]);

        if (results.length === 0 || results[0].length === 0) {
            return res.status(404).json({ message: 'No se encontraron notas para esta actividad y sección' });
        }

        res.status(200).json(results[0]); // Accedemos al primer conjunto de resultados
    } catch (error) {
        console.error('Error al obtener las notas:', error);
        res.status(500).json({ message: 'Error al obtener las notas', error });
    }
};




//--------------------------------------------------------------------Cuadro------------------------
export const obtenerNotasYPromedio = async (req, res) => {
    const { CodSeccionMatricula } = req.params; // Parámetro en la URL

    try {
        // Llamar al procedimiento almacenado con el parámetro
        const [rows] = await pool.query('CALL ObtenerNotasYPromedio(?)', [CodSeccionMatricula]);

        if (rows[0].length > 0) {
            // Unificar datos en un solo conjunto
            const notasUnificadas = rows[0].reduce((resultado, notaParcial) => {
                // Buscar si ya existe un registro para la asignatura
                let asignatura = resultado.find(item => item.Asignatura === notaParcial.Asignatura);

                if (!asignatura) {
                    // Si no existe, crear un nuevo registro con los datos iniciales
                    asignatura = {
                        Asignatura: notaParcial.Asignatura,
                        NotasParciales: [],
                        PromedioFinal: null // Este se llenará después
                    };
                    resultado.push(asignatura);
                }

                // Agregar las notas parciales
                asignatura.NotasParciales.push({
                    Parcial: notaParcial.Parcial,
                    Nota: notaParcial.Nota_Parcial
                });

                return resultado;
            }, []);

            // Agregar el promedio final de cada asignatura
            rows[1].forEach(promedio => {
                const asignatura = notasUnificadas.find(item => item.Asignatura === promedio.Asignatura);
                if (asignatura) {
                    asignatura.PromedioFinal = promedio.Promedio_Final;
                }
            });

            // Enviar respuesta unificada
            res.status(200).json(notasUnificadas);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron notas para la sección proporcionada' });
        }
    } catch (error) {
        console.error('Error al obtener las notas y promedio:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};