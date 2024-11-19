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

// Controlador para obtener opciones para el formulario de matrícula
export const obtenerOpcionesMatricula = async (req, res) => {
  try {
    // Consultar los grados
    const [grados] = await pool.query('SELECT Cod_grado, Nombre_grado FROM tbl_grados');

    // Consultar los estados de matrícula
    const [estadosMatricula] = await pool.query('SELECT Cod_estado_matricula, Tipo FROM tbl_estado_matricula');

    // Consultar todos los períodos de matrícula (activos e inactivos)
    const [periodosMatriculaRaw] = await pool.query(`
      SELECT Cod_periodo_matricula, Anio_academico, Fecha_inicio, Fecha_fin, estado
      FROM tbl_periodo_matricula
    `);

    const formatDate = (dateString) => {
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    };

    // Formatear todos los períodos
    const periodosMatricula = periodosMatriculaRaw.map(periodo => ({
      Cod_periodo_matricula: periodo.Cod_periodo_matricula,
      Anio_academico: periodo.Anio_academico,
      Fecha_inicio: formatDate(periodo.Fecha_inicio),
      Fecha_fin: formatDate(periodo.Fecha_fin),
      estado: periodo.estado // Mantener el estado para diferenciar
    }));

    // Filtrar los períodos activos para el modal
    const periodosActivos = periodosMatricula.filter(periodo => periodo.estado === 'activo');

    // Consultar los tipos de matrícula
    const [tiposMatricula] = await pool.query('SELECT Cod_tipo_matricula, Tipo FROM tbl_tipo_matricula');

    // Responder con los datos
    res.status(200).json({
      grados,
      estados_matricula: estadosMatricula,
      periodos_matricula: periodosMatricula, // Todos los períodos (para la tabla)
      periodos_activos: periodosActivos, // Solo los períodos activos (para el modal)
      tipos_matricula: tiposMatricula,
    });
  } catch (error) {
    console.error('Error al obtener opciones de matrícula:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

export const obtenerHijosPorDniPadre = async (req, res) => {
    const { dni_padre } = req.params;
  
    try {
      // Buscar el padre en la tabla tbl_personas usando el DNI
      const [[padre]] = await pool.query(
        'SELECT cod_persona, Nombre, Primer_apellido FROM tbl_personas WHERE dni_persona = ?',
        [dni_padre]
      );
  
      // Validar si el padre existe en la base de datos
      if (!padre) {
        return res.status(404).json({ message: 'No se encontró un padre con el DNI proporcionado.' });
      }
  
      // Obtener los hijos asociados al padre usando la relación en tbl_estructura_familiar
      const cod_padre = padre.cod_persona;
      const [hijos] = await pool.query(
        `
        SELECT ef.Cod_persona_estudiante AS Cod_persona, 
               p.Nombre AS Primer_nombre, 
               IFNULL(p.Segundo_nombre, '') AS Segundo_nombre,  -- Si es NULL, usar una cadena vacía
               p.Primer_apellido, 
               IFNULL(p.Segundo_apellido, '') AS Segundo_apellido,  -- Si es NULL, usar una cadena vacía
               p.fecha_nacimiento
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
          Nombre_Padre: padre.Nombre,
          Apellido_Padre: padre.Primer_apellido,
        },
        hijos,
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
