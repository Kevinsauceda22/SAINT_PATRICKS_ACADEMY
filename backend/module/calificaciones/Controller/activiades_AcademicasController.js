import conectarDB from '../../../config/db.js';
import jwt from 'jsonwebtoken';
const pool = await conectarDB();



// Obtener todas las actividades académicas
export const obtenerActividadesAcademicas = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL get_all_actividades_academicas()');

        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'No se encontraron actividades académicas' });
        }
    } catch (error) {
        console.error('Error al obtener las actividades académicas:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// Obtener  las actividades académicas por codigo
export const getActividadesPorProfesor = async (req, res) => {
    const { Cod_profesor } = req.params;

    try {
        const [rows] = await pool.query('CALL ver_actividades_por_profesor(?)', [Cod_profesor]);
        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'No se encontraron actividades académicas para este profesor.' });
        }
    } catch (error) {
        console.error("Error al obtener actividades para el profesor:", error);
        res.status(500).json({ error: "Error al obtener actividades para el profesor" });
    }
};




// Controlador para actualizar una actividad académica
export const actualizarActividadAcademica = async (req, res) => {
    const { id } = req.params;
    const {
        Cod_profesor,
        Cod_ponderacion_ciclo,
        Cod_parcial,
        Nombre_actividad_academica,
        Descripcion,
        Fechayhora_Inicio,
        Fechayhora_Fin,
        Valor,
        Cod_secciones,
        Cod_seccion_asignatura
    } = req.body;

    try {
        // Actualizar la actividad en la base de datos
        await pool.query(
            'UPDATE tbl_actividades_academicas SET Cod_profesor = ?, Cod_ponderacion_ciclo = ?, Cod_parcial = ?, Nombre_actividad_academica = ?, Descripcion = ?, Fechayhora_Inicio = ?, Fechayhora_Fin = ?, Valor = ?, Cod_secciones = ? WHERE Cod_actividad_academica = ?',
            [Cod_profesor, Cod_ponderacion_ciclo, Cod_parcial, Nombre_actividad_academica, Descripcion, Fechayhora_Inicio, Fechayhora_Fin, Valor, Cod_secciones, id]
        );

        // Obtener la lista actualizada de actividades del profesor y asignatura
        const [actividades] = await pool.query(
            'CALL getActividadesPorProfesorYAsignatura(?, ?)',
            [Cod_profesor, Cod_seccion_asignatura]
        );

        res.status(200).json({ mensaje: 'Actividad actualizada correctamente', actividades: actividades[0] });
    } catch (error) {
        console.error('Error al actualizar la actividad:', error);
        res.status(500).json({ mensaje: 'Error al actualizar la actividad', error: error.message });
    }
};





export const eliminarActividadAcademica = async (req, res) => {
    const { Cod_actividad_academica } = req.body;

    // Validación: Verificar que se haya proporcionado el código de la actividad académica
    if (!Cod_actividad_academica) {
        return res.status(400).json({ Mensaje: 'Cod_actividad_academica es requerido' });
    }

    try {
        // Llamada al procedimiento almacenado para eliminar la actividad académica
        await pool.query('CALL eliminar_actividad_academica(?)', [Cod_actividad_academica]);

        // Respuesta exitosa
        res.status(200).json({ Mensaje: 'Actividad académica eliminada exitosamente' });
    } catch (error) {
        // Manejo de errores
        console.error('Error al eliminar la actividad académica:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};



// Obtener actividades académicas por profesor y sección asignatura
export const obtenerActividadesPorSeccionAsignatura = async (req, res) => {
    try {
        // Obtener el token del encabezado
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ mensaje: 'Token no proporcionado' });
        }

        // Decodificar el token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const codPersona = decodedToken.cod_persona;
        if (!codPersona) {
            return res.status(400).json({ mensaje: 'El token no contiene cod_persona' });
        }

        // Obtener el codSeccionAsignatura desde los parámetros
        const codSeccionAsignatura = req.params.codSeccionAsignatura;

        // Llamar al procedimiento almacenado
        const [actividades] = await pool.query('CALL ObtenerActividadesPorSeccionAsignatura(?)', [codSeccionAsignatura]);

        if (actividades.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron actividades académicas' });
        }

        res.status(200).json(actividades[0]); // Accede a la primera parte del resultado
    } catch (error) {
        console.error('Error al obtener las actividades académicas:', error);
        res.status(500).json({ mensaje: 'Error al obtener las actividades académicas' });
    }
};

export const crearActividadPorAsignatura = async (req, res) => {
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

        // Obtener el codProfesor
        const [profesorResult] = await pool.query(
            'SELECT Cod_Profesor FROM tbl_profesores WHERE Cod_Persona = ?',
            [codPersona]
        );

        if (profesorResult.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontró un profesor con este cod_persona' });
        }

        const codProfesor = profesorResult[0].Cod_Profesor;

        // Obtener los datos de la solicitud
        const {
            Cod_profesor,
            Cod_ponderacion_ciclo,
            Cod_parcial,
            Nombre_actividad_academica,
            Descripcion,
            Fechayhora_Inicio,
            Fechayhora_Fin,
            Valor,
            Cod_secciones,
            Cod_seccion_asignatura
        } = req.body;

        // Llamar al procedimiento almacenado
        await pool.query(
            'CALL insert_actividad_academica(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
            Cod_profesor,
            Cod_ponderacion_ciclo,
            Cod_parcial,
            Nombre_actividad_academica,
            Descripcion,
            Fechayhora_Inicio,
            Fechayhora_Fin,
            Valor,
            Cod_secciones,
            Cod_seccion_asignatura
            ]
        );

        res.status(201).json({ mensaje: 'Actividad creada correctamente' });
    } catch (error) {
        console.error('Error al crear la actividad por asignatura:', error);
        res.status(500).json({ mensaje: 'Error al crear la actividad' });
    }
};





export const obtenerActividadesPorAsignatura = async (req, res) => {
    try {
      const { codAsignatura } = req.params;
      console.log('Cod_asignatura recibido:', codAsignatura);
  
      if (!codAsignatura) {
        return res.status(400).json({ mensaje: 'Cod_asignatura es requerido' });
      }
  
      // Llamar al procedimiento almacenado `getActividadesPorAsignatura`
      const [actividades] = await pool.query('CALL getActividadesPorAsignatura(?)', [codAsignatura]);
  
      console.log('Actividades obtenidas:', actividades[0]);
  
      if (!actividades || actividades[0].length === 0) {
        return res.status(404).json({ mensaje: 'No se encontraron actividades para esta asignatura' });
      }
  
      res.status(200).json(actividades[0]);
    } catch (error) {
      console.error('Error al obtener las actividades de la asignatura:', error);
      res.status(500).json({ mensaje: 'Error al obtener las actividades de la asignatura' });
    }
  };
  
  export const registrarActividadPorAsignatura = async (req, res) => {
    try {
        const {
            Cod_profesor,
            Cod_ponderacion_ciclo,
            Cod_parcial,
            Nombre_actividad_academica,
            Descripcion,
            Fechayhora_Inicio,
            Fechayhora_Fin,
            Valor,
            Cod_secciones,
            Cod_seccion_asignatura
        } = req.body;

        if (!Cod_profesor || !Cod_ponderacion_ciclo || !Cod_parcial || !Nombre_actividad_academica || !Valor || !Cod_seccion_asignatura) {
            return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
        }

        // Llama al procedimiento para registrar la actividad
        await pool.query(
            'CALL registrarActividadPorAsignatura(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                Cod_profesor,
                Cod_ponderacion_ciclo,
                Cod_parcial,
                Nombre_actividad_academica,
                Descripcion,
                Fechayhora_Inicio,
                Fechayhora_Fin,
                Valor,
                Cod_secciones,
                Cod_seccion_asignatura
            ]
        );

        // Obtén las actividades actualizadas del profesor y asignatura
        const [actividades] = await pool.query(
            'CALL getActividadesPorProfesorYAsignatura(?, ?)',
            [Cod_profesor, Cod_seccion_asignatura]
        );

        res.status(201).json({ mensaje: 'Actividad creada correctamente', actividades: actividades[0] });
    } catch (error) {
        console.error('Error al registrar la actividad:', error);
        res.status(500).json({ mensaje: 'Error al registrar la actividad', error: error.message });
    }
};



  export const obtenerActividadesPorProfesorYAsignatura = async (req, res) => {
    try {
        const { Cod_profesor, Cod_asignatura } = req.params;

        if (!Cod_profesor || !Cod_asignatura) {
            return res.status(400).json({ mensaje: 'Faltan parámetros obligatorios' });
        }

        const [actividades] = await pool.query(
            'CALL getActividadesPorProfesorYAsignatura(?, ?)',
            [Cod_profesor, Cod_asignatura]
        );

        if (actividades.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron actividades' });
        }

        res.status(200).json(actividades[0]);
    } catch (error) {
        console.error('Error al obtener las actividades:', error);
        res.status(500).json({ mensaje: 'Error al obtener las actividades' });
    }
};

  
  
  