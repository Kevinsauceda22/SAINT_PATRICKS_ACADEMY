// controllers/dashboardController.js
import conectarDB from '../../config/db.js';

const obtenerEstadisticas = async (req, res) => {
  try {
    const pool = await conectarDB();

    // Obtener total de estudiantes matriculados activos
    const [totalEstudiantes] = await pool.query(`
      SELECT COUNT(DISTINCT m.cod_persona) as total 
      FROM tbl_matricula m 
      JOIN tbl_estado_matricula em ON m.Cod_estado_matricula = em.Cod_estado_matricula 
      JOIN tbl_personas p ON m.cod_persona = p.cod_persona
      WHERE em.Tipo = 'Activo'
      AND p.Estado_Persona = 'A'
    `);

    // Obtener nuevas matrículas (último mes)
    const [nuevasMatriculas] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM tbl_matricula m
      JOIN tbl_personas p ON m.cod_persona = p.cod_persona
      WHERE m.fecha_matricula >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
      AND p.Estado_Persona = 'A'
    `);

    // Obtener total de profesores activos
    const [totalProfesores] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM tbl_personas p
      JOIN tbl_profesores prof ON p.cod_persona = prof.Cod_persona
      WHERE p.Estado_Persona = 'A'
      AND p.cod_tipo_persona = (SELECT cod_tipo_persona FROM tbl_tipo_persona WHERE tipo = 'Profesor')
    `);

    // Obtener porcentajes de matrículas activas y pendientes
    const [estadoMatriculas] = await pool.query(`
      SELECT 
        ROUND(
          COUNT(CASE WHEN em.Tipo = 'Activo' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 
          2
        ) as activas,
        ROUND(
          COUNT(CASE WHEN em.Tipo = 'Pendiente' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 
          2
        ) as pendientes
      FROM tbl_matricula m
      JOIN tbl_estado_matricula em ON m.Cod_estado_matricula = em.Cod_estado_matricula
      JOIN tbl_personas p ON m.cod_persona = p.cod_persona
      WHERE p.Estado_Persona = 'A'
    `);

    // Calcular ingresos mensuales
    const [ingresos] = await pool.query(`
      SELECT COALESCE(SUM(c.Monto), 0) as total 
      FROM tbl_caja c
      WHERE c.Estado_pago = 'Pagado'
      AND c.Fecha >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
    `);

    const response = {
      totalEstudiantes: totalEstudiantes[0]?.total || 0,
      nuevasMatriculas: nuevasMatriculas[0]?.total || 0,
      totalProfesores: totalProfesores[0]?.total || 0,
      matriculasActivas: estadoMatriculas[0]?.activas || 0,
      matriculasPendientes: estadoMatriculas[0]?.pendientes || 0,
      ingresosMensuales: ingresos[0]?.total || 0
    };

    res.json(response);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      mensaje: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

const obtenerMatriculasPorGrado = async (req, res) => {
  try {
    const pool = await conectarDB();

    const [matriculas] = await pool.query(`
      SELECT 
        g.Nombre_grado as grado,
        COUNT(CASE WHEN em.Tipo = 'Activo' AND p.Estado_Persona = 'A' 
                  THEN m.Cod_matricula END) as matriculas,
        g.Capacidad_maxima as capacidad
      FROM tbl_grados g
      LEFT JOIN tbl_matricula m ON g.Cod_grado = m.cod_grado
      LEFT JOIN tbl_estado_matricula em ON m.Cod_estado_matricula = em.Cod_estado_matricula
      LEFT JOIN tbl_personas p ON m.cod_persona = p.cod_persona
      GROUP BY g.Cod_grado, g.Nombre_grado, g.Capacidad_maxima
      ORDER BY g.Cod_grado
    `);

    if (!matriculas.length) {
      return res.status(404).json({
        mensaje: 'No se encontraron registros de matrículas por grado'
      });
    }

    res.json(matriculas);
  } catch (error) {
    console.error('Error al obtener matrículas por grado:', error);
    res.status(500).json({
      mensaje: 'Error al obtener matrículas por grado',
      error: error.message
    });
  }
};

const obtenerUltimasMatriculas = async (req, res) => {
  try {
    const pool = await conectarDB();

    const [matriculas] = await pool.query(`
SELECT 
  m.codificacion_matricula,
  CONCAT(
    p.Nombre,
    COALESCE(CONCAT(' ', p.Segundo_nombre), ''),
    ' ',
    p.Primer_apellido,
    COALESCE(CONCAT(' ', p.Segundo_apellido), '')
  ) as nombre_estudiante,
  g.Nombre_grado as grado,
  m.fecha_matricula,
  em.Tipo as estado
FROM tbl_matricula m
JOIN tbl_personas p ON m.cod_persona = p.cod_persona
JOIN tbl_grados g ON m.Cod_grado = g.Cod_grado
JOIN tbl_estado_matricula em ON m.Cod_estado_matricula = em.Cod_estado_matricula
WHERE p.Estado_Persona = 'A'
ORDER BY m.fecha_matricula DESC, m.hora_registro DESC
LIMIT 10;
    `);

    if (!matriculas.length) {
      return res.status(404).json({
        mensaje: 'No se encontraron matrículas recientes'
      });
    }

    res.json(matriculas);
  } catch (error) {
    console.error('Error al obtener últimas matrículas:', error);
    res.status(500).json({
      mensaje: 'Error al obtener últimas matrículas',
      error: error.message
    });
  }
};

export {
  obtenerEstadisticas,
  obtenerMatriculasPorGrado,
  obtenerUltimasMatriculas
};