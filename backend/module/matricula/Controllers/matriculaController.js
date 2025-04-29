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
    const [results] = await pool.query(
      'CALL ObtenerTodasLasMatriculasSaintPatrick(?)',
      [Cod_matricula || null]
    );

    if (!results || results[0].length === 0) {
      return res.status(404).json({ message: 'Matrícula no encontrada' });
    }

    // Eliminar duplicados
    const uniqueResults = [...new Map(results[0].map((item) => [item.Cod_matricula, item])).values()];

    // Ordenar por fecha_matricula de más nueva a más antigua
    const ordenadas = uniqueResults.sort(
      (a, b) => new Date(b.fecha_matricula) - new Date(a.fecha_matricula)
    );

    res.status(200).json({ data: ordenadas });
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

export const obtenerHijosPorDniPadre = async (req, res) => {
  const { dni_padre } = req.params;

  try {
    let padre;

    // Buscar por DNI exacto si es un número de 13 dígitos
    if (/^\d{13}$/.test(dni_padre)) {
      [[padre]] = await pool.query(
        'SELECT cod_persona, Nombre, Segundo_nombre, Segundo_apellido Primer_apellido, dni_persona FROM tbl_personas WHERE dni_persona = ?',
        [dni_padre]
      );
    } else {
      // Buscar por nombre parcial si no es un DNI válido
      const [resultados] = await pool.query(
        `SELECT cod_persona, Nombre, Primer_apellido, dni_persona
         FROM tbl_personas p
         JOIN tbl_estructura_familiar ef ON p.cod_persona = ef.Cod_persona_padre
         WHERE CONCAT(p.Nombre, ' ', p.Primer_apellido) LIKE ?`,
        [`%${dni_padre}%`]
      );
      padre = resultados[0]; // Tomar el primer padre coincidente
    }

    // Validar si se encontró un padre
    if (!padre) {
      return res.status(404).json({ message: 'No se encontró un padre con el dato proporcionado.' });
    }

    // Obtener los hijos usando cod_persona del padre
    const cod_padre = padre.cod_persona;
    const [hijos] = await pool.query(
      `SELECT ef.Cod_persona_estudiante AS Cod_persona, 
              p.Nombre AS Primer_nombre, 
              p.Segundo_nombre, 
              p.Primer_apellido, 
              p.Segundo_apellido, 
              p.fecha_nacimiento,
              p.dni_persona
       FROM tbl_estructura_familiar ef
       JOIN tbl_personas p ON ef.Cod_persona_estudiante = p.cod_persona
       WHERE ef.Cod_persona_padre = ?`,
      [cod_padre]
    );

    if (!hijos || hijos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron hijos asociados al padre proporcionado.' });
    }

    // Responder con los datos del padre y sus hijos
    res.status(200).json({
      padre: {
        Nombre_Padre: padre.Nombre || null,
        Apellido_Padre: padre.Primer_apellido || null,
        dni_persona: padre.dni_persona || null,
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
    console.error('Error al obtener hijos por DNI o nombre del padre:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

export const obtenerSeccionesPorGrado = async (req, res) => {
  const { cod_grado } = req.params;
  const { cod_periodo_matricula } = req.query;

  if (!cod_grado || !cod_periodo_matricula) {
    return res.status(400).json({
      message: 'El código del grado y el período de matrícula son requeridos.',
    });
  }

  if (isNaN(Number(cod_grado)) || isNaN(Number(cod_periodo_matricula))) {
    return res.status(400).json({
      message: 'Parámetros inválidos: deben ser numéricos.',
    });
  }

  try {
    const [secciones] = await pool.query(
      `
      SELECT 
        s.Cod_secciones, 
        s.Nombre_seccion, 
        a.Numero_aula, 
        e.Nombre_edificios, 
        p.Nombre AS Nombre_profesor, 
        p.Primer_apellido AS Apellido_profesor,
        COUNT(sm.Cod_matricula) AS Cantidad_matriculados
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
      LEFT JOIN 
        tbl_secciones_matricula AS sm ON sm.Cod_seccion = s.Cod_secciones
      WHERE 
        s.Cod_grado = ?
        AND s.Cod_periodo_matricula = ?
      GROUP BY 
        s.Cod_secciones, s.Nombre_seccion, a.Numero_aula, e.Nombre_edificios, 
        p.Nombre, p.Primer_apellido
      `,
      [cod_grado, cod_periodo_matricula]
    );

    if (secciones.length === 0) {
      return res.status(200).json({ data: [] });
    }

    res.status(200).json({ data: secciones });
  } catch (error) {
    console.error('Error al obtener secciones por grado y período:', error);
    res.status(500).json({
      message: 'Error en el servidor al obtener las secciones.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
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

  // Validación inicial
  if (!cod_seccion || !anio_academico) {
    return res.status(400).json({
      message: 'El código de la sección y el año académico son requeridos.',
    });
  }

  try {
    // Consulta SQL
    const [alumnos] = await pool.query(
      `
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
      `,
      [cod_seccion, anio_academico]
    );

    console.log('Resultado de la consulta:', alumnos);

    // Verificar si no se encontraron alumnos
    if (!alumnos || alumnos.length === 0) {
      return res.status(404).json({
        message: 'No se encontraron alumnos matriculados para esta sección y año académico.',
      });
    }

    // Enviar los alumnos encontrados
    res.status(200).json({ data: alumnos });
  } catch (error) {
    console.error('Error al obtener alumnos por sección:', error);
    res.status(500).json({
      message: 'Error interno del servidor al obtener los alumnos por sección.',
      error: error.message,
    });
  }
};

// Controlador para obtener el horario basado en la sección del alumno
export const obtenerHorarioPorSeccion = async (req, res) => {
  const { cod_seccion } = req.params;

  try {
    if (!cod_seccion) {
      return res.status(400).json({ message: 'El código de la sección es requerido.' });
    }

    // 1. Obtener horarios de la sección
    const [horarios] = await pool.query(`
      SELECT 
        sa.Cod_seccion_asignatura,
        sa.horario_inicio,
        sa.horario_fin,
        sa.cod_secciones,
        s.Nombre_seccion,
        sa.lunes,
        sa.martes,
        sa.miercoles,
        sa.jueves,
        sa.viernes,
        sa.sabado,
        sa.domingo
      FROM tbl_secciones_asignaturas AS sa
      JOIN tbl_secciones AS s ON sa.cod_secciones = s.Cod_secciones
      WHERE sa.cod_secciones = ?
      ORDER BY sa.horario_inicio;
    `, [cod_seccion]);

    if (!horarios || horarios.length === 0) {
      return res.status(404).json({ message: 'No se encontraron horarios para esta sección.' });
    }

    // 2. Obtener todas las asignaturas
    const [asignaturas] = await pool.query(`
      SELECT Cod_asignatura, Nombre_asignatura FROM tbl_asignaturas;
    `);

    // 3. Crear un diccionario para asignaturas
    const asignaturasMap = {};
    asignaturas.forEach((a) => {
      asignaturasMap[a.Cod_asignatura] = a.Nombre_asignatura;
    });

    // 4. Mapear cada día a su respectivo nombre de asignatura
    const horariosConAsignaturas = horarios.map((h) => ({
      ...h,
      lunes: h.lunes ? asignaturasMap[h.lunes] || 'N/A' : null,
      martes: h.martes ? asignaturasMap[h.martes] || 'N/A' : null,
      miercoles: h.miercoles ? asignaturasMap[h.miercoles] || 'N/A' : null,
      jueves: h.jueves ? asignaturasMap[h.jueves] || 'N/A' : null,
      viernes: h.viernes ? asignaturasMap[h.viernes] || 'N/A' : null,
      sabado: h.sabado ? asignaturasMap[h.sabado] || 'N/A' : null,
      domingo: h.domingo ? asignaturasMap[h.domingo] || 'N/A' : null,
    }));

    // 5. Responder con el nuevo formato
    res.status(200).json({ data: horariosConAsignaturas });

  } catch (error) {
    console.error('Error al obtener el horario:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};




// Controlador para obtener secciones por grado con información adicional, incluyendo el nombre del edificio y número del aula
export const obtenerSeccionesConDetalles = async (req, res) => {
  const { cod_grado } = req.params;
  const { anio_academico } = req.query;

  if (!cod_grado || !anio_academico) {
    return res.status(400).json({ message: 'Grado y año académico son requeridos.' });
  }

  try {
    const [secciones] = await pool.query(
      `SELECT 
        s.Cod_secciones, 
        s.Nombre_seccion, 
        a.Numero_aula,
        e.Nombre_edificios,
        p.Nombre AS Nombre_profesor,
        p.Primer_apellido AS Apellido_profesor
      FROM tbl_secciones AS s
      LEFT JOIN tbl_aula AS a ON s.Cod_aula = a.Cod_aula
      LEFT JOIN tbl_edificio AS e ON a.Cod_edificio = e.Cod_edificio
      LEFT JOIN tbl_profesores AS pr ON s.Cod_profesor = pr.Cod_profesor
      LEFT JOIN tbl_personas AS p ON pr.Cod_persona = p.Cod_persona
      JOIN tbl_periodo_matricula AS pm ON s.Cod_periodo_matricula = pm.Cod_periodo_matricula
      WHERE s.Cod_grado = ? AND pm.Anio_academico = ?`,
      [cod_grado, anio_academico]
    );

    res.status(200).json({ data: secciones });
  } catch (error) {
    console.error('Error al obtener secciones por grado y año:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};





export const buscarPadrePorNombre = async (req, res) => {
  const { nombre } = req.query;

  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ message: 'Debe proporcionar un nombre para buscar.' });
  }

  try {
    const [result] = await pool.query(
      `
      SELECT DISTINCT 
        p.cod_persona, 
        CONCAT(p.Nombre, ' ', p.Primer_apellido) AS nombre_completo, 
        p.dni_persona
      FROM tbl_personas p
      JOIN tbl_estructura_familiar ef 
        ON p.cod_persona = ef.Cod_persona_padre
      WHERE CONCAT(p.Nombre, ' ', p.Primer_apellido) LIKE ?
      `,
      [`%${nombre}%`]
    );

    if (result.length === 0) {
      return res.status(404).json({ message: 'No se encontraron padres con ese nombre.' });
    }

    res.status(200).json({ data: result });
  } catch (error) {
    console.error('Error al buscar padre por nombre:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Controlador para editar una matrícula
// Controlador para editar una matrícula
export const editarMatricula = async (req, res) => {
  const { cod_matricula } = req.params;
  const {
    dni_padre,
    fecha_matricula,
    cod_grado,
    cod_seccion,
    cod_estado_matricula,
    cod_periodo_matricula,
    cod_tipo_matricula,
    cod_hijo,
  } = req.body;

  // Log para ver lo que se recibe
  console.log('Datos recibidos en editarMatricula:', {
    cod_matricula,
    dni_padre,
    fecha_matricula,
    cod_grado,
    cod_seccion,
    cod_estado_matricula,
    cod_periodo_matricula,
    cod_tipo_matricula,
    cod_hijo,
  });

  // Validación
  if (
    !validarCamposMatricula({
      dni_padre,
      fecha_matricula,
      cod_grado,
      cod_seccion,
      cod_estado_matricula,
      cod_periodo_matricula,
      cod_tipo_matricula,
      cod_hijo,
    })
  ) {
    return res.status(400).json({ message: 'Todos los campos son requeridos para editar.' });
  }

  try {
    // Ejecutar procedimiento almacenado
    await pool.query('CALL EditarMatriculaSaintPatrickAcademy(?, ?, ?, ?, ?, ?, ?, ?, ?, @mensaje)', [
      cod_matricula,
      dni_padre,
      fecha_matricula,
      cod_grado,
      cod_seccion,
      cod_estado_matricula,
      cod_periodo_matricula,
      cod_tipo_matricula,
      cod_hijo,
    ]);

    res.status(200).json({ message: 'Matrícula actualizada correctamente.' });
  } catch (error) {
    console.error('Error detallado en editarMatricula:', error);
    res.status(500).json({ 
      message: 'Error en el servidor al editar matrícula.', 
      error: error.sqlMessage || error.message || 'Error desconocido' 
    });
  }
};


// Controlador para eliminar una matrícula
export const eliminarMatricula = async (req, res) => {
  const { cod_matricula } = req.params;

  if (!cod_matricula) {
    return res.status(400).json({ message: 'El código de matrícula es requerido.' });
  }

  try {
    // Asumiendo que tienes un procedimiento almacenado para eliminar una matrícula
    await pool.query('CALL EliminarMatriculaSaintPatrickAcademy(?)', [cod_matricula]);

    res.status(200).json({ message: 'Matrícula eliminada correctamente.' });
  } catch (error) {
    console.error('Error al eliminar matrícula:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};
