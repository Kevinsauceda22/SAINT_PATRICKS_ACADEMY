// Importar la configuración de la base de datos
import conectarDB from '../../../config/db.js';

const pool = await conectarDB();

// Utilidad para la validación de parámetros
const validarCamposMatricula = (params) => 
  Object.values(params).every((param) => 
    param !== undefined && 
    param !== null && 
    (typeof param === 'string' ? param.trim() !== '' : true) // Solo aplica trim() a strings
  );

  export const crearMatricula = async (req, res) => {
    const {
      dni_padre,
      fecha_matricula,
      cod_grado,
      cod_seccion,
      cod_estado_matricula,
      cod_periodo_matricula,
      cod_tipo_matricula,
      cod_hijo, // Asegúrate de que este dato venga del frontend
    } = req.body;
  
    if (
      !validarCamposMatricula({
        dni_padre,
        fecha_matricula,
        cod_grado,
        cod_seccion,
        cod_estado_matricula,
        cod_periodo_matricula,
        cod_tipo_matricula,
        cod_hijo, // Validar también este nuevo campo
      })
    ) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }
  
    try {
      // Asegúrate de pasar los 9 argumentos al procedimiento almacenado
      await pool.query('CALL CrearMatriculaSaintPatrickAcademy(?, ?, ?, ?, ?, ?, ?, ?, @mensaje)', [
        dni_padre,
        fecha_matricula,
        cod_grado,
        cod_seccion,
        cod_estado_matricula,
        cod_periodo_matricula,
        cod_tipo_matricula,
        cod_hijo, // Aquí se añade el argumento adicional
      ]);
  
      const [[{ mensaje }]] = await pool.query('SELECT @mensaje AS mensaje');
      console.log('Mensaje de la DB:', mensaje); // Log adicional para ver el mensaje de la DB
  
      res.status(201).json({ message: mensaje });
    } catch (error) {
      console.error('Error al crear la matrícula:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  };
  
// Controlador para obtener todas las matrículas o una matrícula específica
export const obtenerMatriculas = async (req, res) => {
  const { Cod_matricula } = req.params;

  try {
    const [results] = await pool.query('CALL ObtenerTodasLasMatriculasSaintPatrick(?)', [Cod_matricula || null]);

    if (!results || results[0].length === 0) {
      return res.status(404).json({ message: 'Matrícula no encontrada' });
    }

    // Eliminar duplicados en los resultados de la matrícula
    const uniqueResults = [...new Map(results[0].map((item) => [item.Cod_matricula, item])).values()];

    res.status(200).json({ data: uniqueResults });
  } catch (error) {
    console.error('Error al obtener las matrículas:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

export const obtenerOpcionesMatricula = async (req, res) => {
  try {
    // Consultar los grados
    const [grados] = await pool.query(`
      SELECT Cod_grado, 
             Nombre_grado 
      FROM tbl_grados
      WHERE Nombre_grado IS NOT NULL
    `);

    // Consultar los estados de matrícula
    const [estadosMatricula] = await pool.query(`
      SELECT Cod_estado_matricula, 
             Tipo 
      FROM tbl_estado_matricula
      WHERE Tipo IS NOT NULL
    `);

    // Consultar todos los períodos de matrícula (activos e inactivos)
    const [periodosMatriculaRaw] = await pool.query(`
      SELECT Cod_periodo_matricula, 
             Anio_academico, 
             Fecha_inicio, 
             Fecha_fin, 
             estado
      FROM tbl_periodo_matricula
      WHERE Anio_academico IS NOT NULL
    `);

    // Función para formatear fechas
    const formatDate = (dateString) => {
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      return dateString ? new Date(dateString).toLocaleDateString('es-ES', options) : 'Sin asignar';
    };

    // Formatear todos los períodos
    const periodosMatricula = periodosMatriculaRaw.map((periodo) => ({
      Cod_periodo_matricula: periodo.Cod_periodo_matricula,
      Anio_academico: periodo.Anio_academico || 'Sin asignar',
      Fecha_inicio: formatDate(periodo.Fecha_inicio),
      Fecha_fin: formatDate(periodo.Fecha_fin),
      estado: periodo.estado || 'Sin asignar',
    }));

    // Consultar los tipos de matrícula
    const [tiposMatricula] = await pool.query(`
      SELECT Cod_tipo_matricula, 
             Tipo 
      FROM tbl_tipo_matricula
      WHERE Tipo IS NOT NULL
    `);

    // Responder con los datos obtenidos
    res.status(200).json({
      grados: grados.length > 0 ? grados : [{ Cod_grado: null, Nombre_grado: 'Sin asignar' }],
      estados_matricula: estadosMatricula.length > 0 ? estadosMatricula : [{ Cod_estado_matricula: null, Tipo: 'Sin asignar' }],
      periodos_matricula: periodosMatricula.length > 0 ? periodosMatricula : [{ Cod_periodo_matricula: null, Anio_academico: 'Sin asignar', Fecha_inicio: 'Sin asignar', Fecha_fin: 'Sin asignar', estado: 'Sin asignar' }],
      tipos_matricula: tiposMatricula.length > 0 ? tiposMatricula : [{ Cod_tipo_matricula: null, Tipo: 'Sin asignar' }],
    });
  } catch (error) {
    console.error('Error al obtener opciones de matrícula:', error);
    res.status(500).json({
      message: 'Error en el servidor al obtener las opciones de matrícula.',
      error: error.message,
    });
  }
};

// Controlador para obtener el nombre y apellido del padre junto con los hijos asociados, usando el DNI del padre
export const obtenerHijosPorDniPadre = async (req, res) => {
  const { dni_padre } = req.params;

  try {
    // Buscar al padre en la tabla `tbl_personas` usando el DNI
    const [[padre]] = await pool.query(
      'SELECT cod_persona, Nombre, Primer_apellido FROM tbl_personas WHERE dni_persona = ?',
      [dni_padre]
    );

    // Validar si el padre existe en la base de datos
    if (!padre) {
      return res.status(404).json({ message: 'No se encontró un padre con el DNI proporcionado.' });
    }

    // Obtener los hijos asociados al padre usando la relación en `tbl_estructura_familiar`
    const cod_padre = padre.cod_persona;
    const [hijos] = await pool.query(
      `
      SELECT ef.Cod_persona_estudiante AS Cod_persona, 
             p.Nombre AS Primer_nombre, 
             p.Segundo_nombre, 
             p.Primer_apellido, 
             p.Segundo_apellido, 
             p.fecha_nacimiento,
             p.dni_persona -- Incluir el DNI del hijo
      FROM tbl_estructura_familiar AS ef
      JOIN tbl_personas AS p ON ef.Cod_persona_estudiante = p.cod_persona
      WHERE ef.Cod_persona_padre = ?
    `,
      [cod_padre]
    );

    // Si no hay hijos asociados, enviar un mensaje adecuado
    if (hijos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron hijos asociados al padre proporcionado.' });
    }

    // Enviar la respuesta con la información del padre y los hijos
    res.status(200).json({
      padre: {
        Nombre_Padre: padre.Nombre || null,
        Apellido_Padre: padre.Primer_apellido || null,
      },
      hijos: hijos.map((hijo) => ({
        Cod_persona: hijo.Cod_persona,
        Primer_nombre: hijo.Primer_nombre || null,
        Segundo_nombre: hijo.Segundo_nombre || null,
        Primer_apellido: hijo.Primer_apellido || null,
        Segundo_apellido: hijo.Segundo_apellido || null,
        fecha_nacimiento: hijo.fecha_nacimiento || null,
        dni_persona: hijo.dni_persona || null,
      })),
    });
  } catch (error) {
    console.error('Error al obtener hijos por DNI del padre:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Controlador para obtener secciones por grado con información adicional, incluyendo el nombre del edificio y número del aula
export const obtenerSeccionesPorGrado = async (req, res) => {
  const { cod_grado } = req.params;

  try {
    const [secciones] = await pool.query(`
      SELECT 
        s.Cod_secciones, 
        s.Nombre_seccion, 
        a.Numero_aula,                  -- Número del aula de TBL_AULA
        e.Nombre_edificios,             -- Nombre del edificio de TBL_EDIFICIOS
        p.Nombre AS Nombre_profesor,    -- Nombre del profesor de TBL_PERSONAS
        p.Primer_apellido AS Apellido_profesor -- Apellido del profesor de TBL_PERSONAS
      FROM 
        tbl_secciones AS s
      LEFT JOIN 
        tbl_aula AS a ON s.Cod_aula = a.Cod_aula
      LEFT JOIN 
        tbl_edificio AS e ON a.Cod_edificio = e.Cod_edificio
      LEFT JOIN 
        tbl_profesores AS pr ON s.Cod_profesor = pr.Cod_profesor
      LEFT JOIN 
        tbl_personas AS p ON pr.Cod_persona = p.Cod_persona
      WHERE 
        s.Cod_grado = ?
    `, [cod_grado]);

    if (secciones.length === 0) {
      return res.status(200).json({ data: [] }); // Devolver array vacío si no hay secciones
    }

    // Devolver las secciones con la información adicional
    res.status(200).json({ data: secciones });
  } catch (error) {
    console.error('Error al obtener secciones por grado:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};
// Controlador para obtener alumnos matriculados por grado y año académico
export const obtenerAlumnosMatriculadosPorGradoYAno = async (req, res) => {
  const { cod_grado } = req.params;
  const { anio_academico } = req.query;

  try {
    // Consulta SQL actualizada para combinar `tbl_matriculas` y `tbl_secciones_matricula`
    const [alumnos] = await pool.query(`
      SELECT 
        m.Cod_matricula,
        p.Nombre,
        p.Segundo_nombre,
        p.Primer_apellido,
        p.Segundo_apellido,
        p.fecha_nacimiento,
        g.Nombre_grado,
        s.Nombre_seccion,
        p.Nombre AS Nombre_profesor,
        p.Primer_apellido AS Apellido_profesor
      FROM tbl_matricula AS m
      JOIN tbl_secciones_matricula AS sm ON m.Cod_matricula = sm.Cod_matricula
      JOIN tbl_personas AS p ON m.Cod_persona = p.Cod_persona
      JOIN tbl_grados AS g ON sm.Cod_grado = g.Cod_grado
      LEFT JOIN tbl_secciones AS s ON sm.Cod_seccion = s.Cod_secciones
      LEFT JOIN tbl_profesores AS pr ON s.Cod_profesor = pr.Cod_profesor
      JOIN tbl_periodo_matricula AS pm ON m.Cod_periodo_matricula = pm.Cod_periodo_matricula
      WHERE sm.Cod_grado = ? AND pm.Anio_academico = ?
    `, [cod_grado, anio_academico]);

    // Verificar si se encontraron alumnos
    if (alumnos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron alumnos matriculados para este grado y año académico.' });
    }

    // Devolver los datos de los alumnos
    res.status(200).json({ data: alumnos });
  } catch (error) {
    console.error('Error al obtener alumnos matriculados por grado y año académico:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Controlador para obtener las matrículas con el año académico
export const obtenerMatriculasConPeriodo = async (req, res) => {
  try {
    // Ejecuta la consulta SQL para obtener las matrículas con los años académicos
    const [matriculas] = await pool.query(`
      SELECT 
        m.Cod_matricula,
        m.codificacion_matricula,
        p.Nombre,
        p.Segundo_nombre,
        p.Primer_apellido,
        p.Segundo_apellido,
        p.fecha_nacimiento,
        g.Nombre_grado,
        s.Nombre_seccion,
        pm.Anio_academico
      FROM tbl_matricula AS m
      JOIN tbl_secciones_matricula AS sm ON m.Cod_matricula = sm.Cod_matricula
      JOIN tbl_personas AS p ON m.Cod_persona = p.Cod_persona
      JOIN tbl_grados AS g ON sm.Cod_grado = g.Cod_grado
      LEFT JOIN tbl_secciones AS s ON sm.Cod_seccion = s.Cod_secciones
      JOIN tbl_periodo_matricula AS pm ON m.Cod_periodo_matricula = pm.Cod_periodo_matricula
    `);

    res.status(200).json({ data: matriculas });
  } catch (error) {
    console.error('Error al obtener las matrículas con el período académico:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};
export const obtenerAlumnosPorSeccion = async (req, res) => {
  const { cod_seccion } = req.params;
  const { anio_academico } = req.query;

  try {
    // Asegúrate de que la consulta SQL sea correcta
    const [alumnos] = await pool.query(`
      SELECT 
        m.Cod_matricula,
        p.Nombre,
        p.Segundo_nombre,
        p.Primer_apellido,
        p.Segundo_apellido,
        p.fecha_nacimiento,
        g.Nombre_grado,
        s.Nombre_seccion
      FROM tbl_matricula AS m
      JOIN tbl_secciones_matricula AS sm ON m.Cod_matricula = sm.Cod_matricula
      JOIN tbl_personas AS p ON m.Cod_persona = p.Cod_persona
      JOIN tbl_grados AS g ON sm.Cod_grado = g.Cod_grado
      LEFT JOIN tbl_secciones AS s ON sm.Cod_seccion = s.Cod_secciones
      JOIN tbl_periodo_matricula AS pm ON m.Cod_periodo_matricula = pm.Cod_periodo_matricula
      WHERE sm.Cod_seccion = ? AND pm.Anio_academico = ?
    `, [cod_seccion, anio_academico]);

    if (alumnos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron alumnos matriculados para esta sección y año académico.' });
    }

    res.status(200).json({ data: alumnos });
  } catch (error) {
    console.error('Error al obtener alumnos por sección:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};// Controlador para obtener el horario basado en la sección del alumno
export const obtenerHorarioPorSeccion = async (req, res) => {
  const { cod_seccion } = req.params; // Obtiene el código de la sección desde la URL

  try {
    // Validar que el parámetro `cod_seccion` esté presente
    if (!cod_seccion) {
      return res.status(400).json({ message: 'El código de la sección es requerido.' });
    }

    // Consulta para obtener los horarios por sección
    const [horarios] = await pool.query(`
      SELECT 
        sa.Cod_seccion_asignatura,
        sa.Hora_inicio,
        sa.Hora_fin,
        sa.Cod_secciones,
        s.Nombre_seccion,
        sa.Dias_nombres AS Nombre_dia, -- Cambiado para usar directamente la columna
        a.Nombre_asignatura
      FROM tbl_secciones_asignaturas AS sa
      JOIN tbl_grados_asignaturas AS ga ON sa.Cod_grados_asignaturas = ga.Cod_grados_asignaturas
      JOIN tbl_asignaturas AS a ON ga.Cod_asignatura = a.Cod_asignatura
      JOIN tbl_secciones AS s ON sa.Cod_secciones = s.Cod_secciones
      WHERE sa.Cod_secciones = ?
      ORDER BY sa.Dias_nombres, sa.Hora_inicio;
    `, [cod_seccion]);

    // Validar si no se encontraron horarios
    if (!horarios || horarios.length === 0) {
      return res.status(404).json({ message: 'No se encontraron horarios para esta sección.' });
    }

    // Enviar la respuesta con los datos del horario
    res.status(200).json({ data: horarios });
  } catch (error) {
    console.error('Error al obtener el horario:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};
