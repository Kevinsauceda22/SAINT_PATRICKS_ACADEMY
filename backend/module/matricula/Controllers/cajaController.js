// Importar la configuración de la base de datos
import conectarDB from '../../../config/db.js';

const pool = await conectarDB();

// Controlador para obtener todos los registros de `tbl_caja`
export const obtenerRegistrosCaja = async (req, res) => {
  try {
    // Llamada al procedimiento almacenado sin filtros para obtener todos los registros
    const [results] = await pool.query('CALL VerCaja(NULL)');

    // Revisar si hay registros
    if (!results || results[0].length === 0) {
      return res.status(404).json({ message: 'No se encontraron registros en la caja' });
    }

    res.status(200).json({ data: results[0] });
  } catch (error) {
    console.error('Error al obtener los registros de la caja:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Controlador para obtener un registro específico en `tbl_caja` por `cod_caja`
export const obtenerRegistroCajaPorCod = async (req, res) => {
  const { cod_caja } = req.params;

  try {
    // Llamada al procedimiento almacenado con el `cod_caja` proporcionado
    const [results] = await pool.query('CALL VerCaja(?)', [cod_caja]);

    // Verificar si se encontró el registro
    if (!results || results[0].length === 0) {
      return res.status(404).json({ message: 'Registro de caja no encontrado' });
    }

    res.status(200).json({ data: results[0] });
  } catch (error) {
    console.error('Error al obtener el registro de la caja:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

export const registrarPago = async (req, res) => {
  const {
    cod_caja, // Código de la caja
    monto, // Monto inicial
    descripcion, // Descripción de la caja
    cod_concepto, // Código del concepto
    cod_descuento = null, // Código del descuento (puede ser NULL si no se aplica descuento)
  } = req.body;

  // Validación de campos requeridos
  if (!cod_caja || !monto || !descripcion || !cod_concepto) {
    return res.status(400).json({ message: 'Todos los campos son requeridos.' });
  }

  try {
    // Llamada al procedimiento almacenado `RegistrarPagoCaja`
    const [result] = await pool.query(
      'CALL RegistrarPagoCaja(?, ?, ?, ?, ?)',
      [cod_caja, monto, descripcion, cod_concepto, cod_descuento]
    );

    // Validación de resultados
    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'No se pudo registrar el pago. Verifique los datos ingresados.' });
    }

    // Respuesta exitosa
    return res.status(201).json({
      message: 'Pago registrado exitosamente.',
      data: {
        cod_caja,
        monto: monto - (result[0]?.descuento_aplicado || 0), // Monto final con descuento aplicado
        cod_descuento,
      },
    });
  } catch (error) {
    console.error('Error al registrar el pago:', error);
    return res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

// Controlador para obtener todos los descuentos
export const obtenerDescuentos = async (req, res) => {
  try {
    // Consulta para obtener todos los descuentos activos
    const [descuentos] = await pool.query(`
      SELECT 
        Cod_descuento, 
        Nombre_descuento, 
        Valor, 
        Fecha_inicio, 
        Fecha_fin, 
        Descripcion
      FROM tbl_descuentos
      WHERE CURDATE() BETWEEN Fecha_inicio AND Fecha_fin
    `);

    // Validar si se encontraron descuentos
    if (descuentos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron descuentos disponibles.' });
    }

    // Devolver la lista de descuentos
    res.status(200).json({ data: descuentos });
  } catch (error) {
    console.error('Error al obtener los descuentos:', error);
    res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
  }
};

// Controlador para obtener las matrículas de los hijos con pagos pendientes usando el DNI del padre
export const obtenerMatriculasPendientesPorDniPadre = async (req, res) => {
    const { dni_padre } = req.params;
  
    try {
      // Paso 1: Obtener el `cod_persona` del padre usando el `dni_padre`
      const [[padre]] = await pool.query(
        'SELECT cod_persona FROM tbl_personas WHERE dni_persona = ?', 
        [dni_padre]
      );
  
      // Verificar si el padre existe
      if (!padre) {
        return res.status(404).json({ message: 'No se encontró un padre con el DNI proporcionado.' });
      }
  
      const cod_padre = padre.cod_persona;
  
      // Paso 2: Obtener las matrículas de los hijos asociados al `cod_padre` y pagos pendientes en `tbl_caja`
      const [matriculasPendientes] = await pool.query(`
        SELECT 
            matricula.Cod_matricula,
            matricula.codificacion_matricula,
            matricula.fecha_matricula,
            matricula.Cod_estado_matricula,
            matricula.Cod_periodo_matricula,
            matricula.Cod_tipo_matricula,
            
            hijo.cod_persona AS Cod_Hijo,
            hijo.Nombre AS Nombre_Hijo,
            hijo.Primer_apellido AS Apellido_Hijo,
            
            padre.cod_persona AS Cod_Padre,
            padre.Nombre AS Nombre_Padre,
            padre.Primer_apellido AS Apellido_Padre,
            
            c.Cod_caja,
            c.Fecha AS Fecha_pago,
            c.Monto,
            c.Descripcion,
            c.Estado_pago
        FROM 
            TBL_MATRICULA AS matricula
        JOIN 
            tbl_personas AS hijo ON matricula.cod_persona = hijo.cod_persona
        JOIN 
            tbl_estructura_familiar AS estructura ON hijo.cod_persona = estructura.Cod_persona_estudiante
        JOIN 
            tbl_personas AS padre ON estructura.Cod_persona_padre = padre.cod_persona
        JOIN 
            tbl_caja AS c ON matricula.Cod_caja = c.cod_caja
        WHERE 
            padre.cod_persona = ? AND c.Estado_pago = 'Pendiente';
      `, [cod_padre]);
  
      // Verificar si hay matrículas pendientes asociadas
      if (matriculasPendientes.length === 0) {
        return res.status(404).json({ message: 'No se encontraron matrículas pendientes de pago para los hijos de este padre.' });
      }
  
      res.status(200).json({ data: matriculasPendientes });
    } catch (error) {
      console.error('Error al obtener matrículas pendientes por DNI del padre:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  };
  // Controlador para obtener todas las matrículas pagadas
export const obtenerMatriculasPagadas = async (req, res) => {
    try {
      // Llamada al procedimiento almacenado o consulta SQL para obtener las matrículas pagadas
      const [results] = await pool.query(`
        SELECT 
          matricula.Cod_matricula,
          matricula.codificacion_matricula,
          matricula.fecha_matricula,
          estudiante.cod_persona AS Cod_Hijo,
          estudiante.Nombre AS Nombre_Hijo,
          estudiante.Primer_apellido AS Apellido_Hijo,
          padre.cod_persona AS Cod_Padre,
          padre.Nombre AS Nombre_Padre,
          padre.Primer_apellido AS Apellido_Padre,
          c.Fecha AS Fecha_pago,
          c.Monto,
          c.Descripcion,
          c.Estado_pago
        FROM 
          tbl_matricula AS matricula
        JOIN 
          tbl_personas AS estudiante ON matricula.cod_persona = estudiante.cod_persona
        JOIN 
          tbl_estructura_familiar AS estructura ON estudiante.cod_persona = estructura.Cod_persona_estudiante
        JOIN 
          tbl_personas AS padre ON estructura.Cod_persona_padre = padre.cod_persona
        JOIN 
          tbl_caja AS c ON matricula.Cod_caja = c.Cod_caja
        WHERE 
          c.Estado_pago = 'Pagado'
      `);
  
      // Verificar si hay resultados
      if (results.length === 0) {
        return res.status(404).json({ message: 'No se encontraron matrículas pagadas.' });
      }
  
      res.status(200).json({ data: results });
    } catch (error) {
      console.error('Error al obtener las matrículas pagadas:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  };
  // Controlador para obtener la lista de conceptos disponibles
export const obtenerConceptos = async (req, res) => {
    try {
      // Consulta para obtener todos los conceptos
      const [conceptos] = await pool.query(`
        SELECT Cod_concepto, Concepto
        FROM tbl_concepto_pago
      `);
  
      // Verificar si hay conceptos disponibles
      if (conceptos.length === 0) {
        return res.status(404).json({ message: 'No se encontraron conceptos.' });
      }
  
      // Devolver la lista de conceptos
      res.status(200).json({ data: conceptos });
    } catch (error) {
      console.error('Error al obtener los conceptos:', error);
      res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
  };

// Controlador para obtener todas las matrículas pendientes
export const obtenerTodasLasMatriculasPendientes = async (req, res) => {
  try {
    // Consulta para obtener todas las matrículas pendientes sin filtrar por DNI
    const [matriculasPendientes] = await pool.query(`
      SELECT 
        matricula.Cod_matricula,
        matricula.codificacion_matricula,
        matricula.fecha_matricula,
        matricula.Cod_estado_matricula,
        matricula.Cod_periodo_matricula,
        matricula.Cod_tipo_matricula,
        
        estudiante.cod_persona AS Cod_Hijo,
        estudiante.Nombre AS Nombre_Hijo,
        estudiante.Primer_apellido AS Apellido_Hijo,
        
        padre.cod_persona AS Cod_Padre,
        padre.Nombre AS Nombre_Padre,
        padre.Primer_apellido AS Apellido_Padre,
        
        c.Cod_caja,
        c.Fecha AS Fecha_pago,
        c.Monto,
        c.Descripcion,
        c.Estado_pago
      FROM 
        tbl_matricula AS matricula
      JOIN 
        tbl_personas AS estudiante ON matricula.cod_persona = estudiante.cod_persona
      JOIN 
        tbl_estructura_familiar AS estructura ON estudiante.cod_persona = estructura.Cod_persona_estudiante
      JOIN 
        tbl_personas AS padre ON estructura.Cod_persona_padre = padre.cod_persona
      JOIN 
        tbl_caja AS c ON matricula.Cod_caja = c.cod_caja
      WHERE 
        c.Estado_pago = 'Pendiente'
    `);

    // Verificar si hay matrículas pendientes
    if (matriculasPendientes.length === 0) {
      return res.status(404).json({ message: 'No se encontraron matrículas pendientes de pago.' });
    }

    res.status(200).json({ data: matriculasPendientes });
  } catch (error) {
    console.error('Error al obtener todas las matrículas pendientes:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};
// Controlador para obtener los detalles del recibo con descuento y monto original
export const obtenerDetallesRecibo = async (req, res) => {
  const { cod_caja } = req.params;

  try {
    // Realiza la consulta a la base de datos
    const [results] = await pool.query(`
      SELECT 
        c.Cod_caja,
        c.fecha AS Fecha_pago,
        c.descripcion AS Descripcion,
        c.monto AS Monto_final, -- El monto final después del descuento
        c.cod_concepto AS Cod_concepto,
        d.Nombre_descuento AS Nombre_descuento,
        d.Valor AS Valor_descuento, -- El valor del descuento aplicado
        (c.monto + IFNULL(d.Valor, 0)) AS Monto_original -- Calcula el monto original sumando el descuento
      FROM 
        tbl_caja c
      LEFT JOIN 
        TBL_CAJA_DESCUENTO cd ON c.Cod_caja = cd.Cod_caja
      LEFT JOIN 
        TBL_DESCUENTOS d ON cd.Cod_descuento = d.Cod_descuento
      WHERE 
        c.Cod_caja = ?;
    `, [cod_caja]);

    // Verificar si hay resultados
    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'No se encontraron detalles para el recibo' });
    }

    // Enviar la respuesta con los detalles
    res.status(200).json({ data: results[0] });
  } catch (error) {
    console.error('Error al obtener los detalles del recibo:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};
export const insertarCajaOficialConDescuento = async (req, res) => {
  const {
    dni_padre,
    monto,
    descripcion,
    cod_concepto,
    cod_descuento,
  } = req.body;

  if (!dni_padre || !monto || !descripcion || !cod_concepto) {
    return res.status(400).json({ message: 'Todos los campos son requeridos.' });
  }

  try {
    // Paso 1: Verificar si el padre existe
    const [[padre]] = await pool.query(
      'SELECT cod_persona FROM tbl_personas WHERE dni_persona = ?',
      [dni_padre]
    );

    if (!padre) {
      return res.status(404).json({ message: 'No se encontró un padre con el DNI proporcionado.' });
    }

    const cod_persona = padre.cod_persona;

    // Paso 2: Insertar la nueva caja
    const [resultCaja] = await pool.query(
      'INSERT INTO tbl_caja (Fecha, Monto, Descripcion, Cod_persona, Cod_concepto, Estado_pago) VALUES (CURDATE(), ?, ?, ?, ?, ?)',
      [monto, descripcion, cod_persona, cod_concepto, 'Pagado']
    );

    const nuevoCodCaja = resultCaja.insertId;

    let descuentoAplicado = 0;

    // Paso 3: Verificar y aplicar descuento
    if (cod_descuento) {
      const [[descuento]] = await pool.query(
        'SELECT Valor, IF(Valor <= 1, "PORCENTAJE", "MONTO") AS Tipo FROM tbl_descuentos WHERE Cod_descuento = ?',
        [cod_descuento]
      );

      if (!descuento) {
        return res.status(404).json({ message: 'El descuento proporcionado no existe.' });
      }

      const { Valor: valor_descuento, Tipo: tipo_descuento } = descuento;

      if (tipo_descuento === 'PORCENTAJE') {
        descuentoAplicado = monto * valor_descuento; // Descuento porcentual
      } else {
        descuentoAplicado = valor_descuento; // Descuento fijo
      }

      // Registrar la relación entre caja y descuento
      await pool.query(
        'INSERT INTO tbl_caja_descuento (Cod_caja, Cod_descuento) VALUES (?, ?)',
        [nuevoCodCaja, cod_descuento]
      );
    }

    // Calcular el monto final
    const montoFinal = Math.max(0, monto - descuentoAplicado);

    // Paso 4: Actualizar la caja con el monto final
    await pool.query(
      'UPDATE tbl_caja SET Monto = ? WHERE Cod_caja = ?',
      [montoFinal, nuevoCodCaja]
    );

    res.status(201).json({
      message: 'Caja oficial creada exitosamente.',
      cod_caja: nuevoCodCaja,
      descuento_aplicado: descuentoAplicado,
      monto_final: montoFinal,
    });
  } catch (error) {
    console.error('Error al crear la caja oficial con descuento:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};


export const obtenerTodasLasCajasPendientes = async (req, res) => {
  try {
    const [cajasPendientes] = await pool.query(`
      SELECT 
        c.Cod_caja,
        c.Monto,
        c.Descripcion,
        c.Hora_registro,
        c.Fecha AS Fecha_pago,
        c.Estado_pago,
        p.Nombre AS Nombre_Padre,
        p.Primer_apellido AS Apellido_Padre
      FROM 
        tbl_caja AS c
      LEFT JOIN 
        tbl_personas AS p ON c.Cod_persona = p.Cod_persona
      WHERE 
        c.Estado_pago IN ('Pendiente', 'Pagado')
      ORDER BY 
        c.Fecha DESC, 
        c.Hora_registro DESC
    `);

    // Si no hay resultados
    if (!cajasPendientes.length) {
      return res.status(404).json({ message: 'No se encontraron cajas pendientes o pagadas.' });
    }

    // Devolver los datos al frontend
    return res.status(200).json({ data: cajasPendientes });
  } catch (error) {
    console.error('Error al obtener las cajas pendientes:', error);
    return res.status(500).json({
      message: 'Ocurrió un error al obtener las cajas pendientes o pagadas.',
      error: error.message,
    });
  }
};

// Controlador para obtener el valor del parámetro "Matricula"
export const obtenerValorMatricula = async (req, res) => {
  try {
    // Consulta para obtener el valor del parámetro "Matricula"
    const [rows] = await pool.query('SELECT Valor FROM tbl_parametros WHERE Parametro = ?', ['Matricula']);

    if (rows.length === 0) {
      // Si no se encuentra el parámetro
      return res.status(404).json({ message: 'El valor del parámetro "Matricula" no se encontró.' });
    }

    // Devolver solo el valor del parámetro
    res.status(200).json({ valor: rows[0].Valor });
  } catch (error) {
    console.error('Error al obtener el valor del parámetro "Matricula":', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};
// Controlador para obtener el código del concepto "Matricula"
export const obtenerConceptoMatricula = async (req, res) => {
  try {
    // Consulta para obtener el código del concepto "Matricula"
    const [rows] = await pool.query(
      'SELECT Cod_concepto FROM tbl_concepto_pago WHERE Concepto = ?',
      ['Pago de matricula']
    );

    if (rows.length === 0) {
      // Si no se encuentra el concepto
      return res
        .status(404)
        .json({ message: 'El concepto "Pago de matricula" no se encontró.' });
    }

    // Devolver solo el código del concepto
    res.status(200).json({ cod_concepto: rows[0].Cod_concepto });
  } catch (error) {
    console.error('Error al obtener el concepto "Pago de matricula":', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// Controlador para buscar cajas por DNI
export const buscarCajasPorDni = async (req, res) => {
  const { dni = '' } = req.query; // Obtener el parámetro `dni` desde la consulta (query)

  try {
    const [results] = await pool.query(
      `SELECT 
        c.Cod_caja,
        c.Monto,
        c.Descripcion,
        c.Hora_registro,
        c.Fecha AS Fecha_pago,
        c.Estado_pago,
        p.Nombre AS Nombre_Padre,
        p.Primer_apellido AS Apellido_Padre,
        p.dni_persona AS DNI_Padre
      FROM 
        tbl_caja AS c
      LEFT JOIN 
        tbl_personas AS p ON c.Cod_persona = p.Cod_persona
      WHERE 
        c.Estado_pago = 'Pendiente'
        AND (p.dni_persona LIKE CONCAT('%', ?, '%') OR ? = '')
      ORDER BY 
        c.Fecha DESC, 
        c.Hora_registro DESC`,
      [dni, dni]
    );

    if (!results.length) {
      return res.status(404).json({ message: 'No se encontraron registros para el DNI proporcionado.' });
    }

    res.status(200).json({ data: results });
  } catch (error) {
    console.error('Error al buscar cajas por DNI:', error);
    res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
  }
};

export const obtenerValorMensualidad = async (req, res) => {
  const { concepto } = req.query; // Recibe el concepto desde el frontend

  try {
    // Validar si el parámetro 'concepto' es proporcionado
    if (!concepto || typeof concepto !== 'string') {
      return res.status(400).json({
        message: 'El parámetro "concepto" es obligatorio y debe ser una cadena de texto.',
      });
    }

    // Validar si el concepto es una mensualidad
    if (!concepto.toLowerCase().includes('mensualidad')) {
      return res.status(200).json({ valor: null }); // No es una mensualidad, retorna null
    }

    // Consultar el valor de la mensualidad en `tbl_parametros`
    const [rows] = await pool.query(
      'SELECT Valor FROM tbl_parametros WHERE Parametro = ?',
      ['Mensualidad']
    );

    // Validar si existe el valor
    if (rows.length === 0 || !rows[0].Valor) {
      return res.status(404).json({
        message: 'No se encontró el valor de la mensualidad en los parámetros.',
      });
    }

    // Retornar el valor de la mensualidad
    res.status(200).json({ valor: rows[0].Valor });
  } catch (error) {
    console.error('Error al obtener el valor de la mensualidad:', error);
    res.status(500).json({ message: 'Error interno del servidor.', error: error.message });
  }
};
