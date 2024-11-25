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
    cod_caja,
    monto,
    descripcion, // Descripción de la caja
    cod_concepto,
    aplicar_descuento, // Indica si hay descuento
    valor_descuento, // Porcentaje o valor fijo del descuento
    descripcion_descuento // Descripción del descuento
  } = req.body;

  // Validación de campos requeridos
  if (!cod_caja || !monto || !descripcion || !cod_concepto) {
    return res.status(400).json({ message: 'Todos los campos son requeridos.' });
  }

  try {
    // Preparar el mensaje de salida
    let mensaje = '';

    // Llamada al procedimiento almacenado para registrar el pago
    const [results] = await pool.query('CALL RegistrarPagoCaja(?, ?, ?, ?, ?, ?, ?)', [
      cod_caja,
      monto,
      descripcion, // Descripción de la caja
      cod_concepto,
      aplicar_descuento, // Booleano
      valor_descuento, // Valor del descuento
      descripcion_descuento // Descripción del descuento
    ]);

    // Obtener el mensaje de confirmación de la base de datos
    const [[{ mensaje: mensajeDB }]] = await pool.query('SELECT @mensaje AS mensaje');
    mensaje = mensajeDB || 'Pago registrado exitosamente.';

    // Verificar si la respuesta fue exitosa
    res.status(201).json({ message: mensaje });
  } catch (error) {
    console.error('Error al registrar el pago:', error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
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
    aplicar_descuento,
    valor_descuento,
    descripcion_descuento,
  } = req.body;

  if (!dni_padre || !monto || !descripcion || !cod_concepto) {
    return res.status(400).json({ message: 'Todos los campos son requeridos.' });
  }

  try {
    // Paso 1: Obtener el cod_persona del padre
    const [[padre]] = await pool.query(
      'SELECT cod_persona FROM tbl_personas WHERE dni_persona = ?',
      [dni_padre]
    );

    if (!padre) {
      return res.status(404).json({ message: 'No se encontró un padre con el DNI proporcionado.' });
    }

    const cod_persona = padre.cod_persona;

    // Paso 2: Insertar la nueva caja en TBL_CAJA
    const [resultCaja] = await pool.query(
      'INSERT INTO tbl_caja (Fecha, Monto, Descripcion, Cod_persona, Cod_concepto, Estado_pago) VALUES (CURDATE(), ?, ?, ?, ?, ?)',
      [monto, descripcion, cod_persona, cod_concepto, 'Pendiente']
    );

    const nuevoCodCaja = resultCaja.insertId;

    let descuentoAplicado = 0;
    let codDescuento = null;

    if (aplicar_descuento) {
      // Paso 3: Crear el descuento en TBL_DESCUENTOS
      const fechaActual = new Date();
      const [resultDescuento] = await pool.query(
        'INSERT INTO tbl_descuentos (Valor, Fecha_inicio, Fecha_fin, Descripcion) VALUES (?, ?, DATE_ADD(?, INTERVAL 30 DAY), ?)',
        [valor_descuento, fechaActual, fechaActual, descripcion_descuento]
      );

      codDescuento = resultDescuento.insertId;

      // Calcular el descuento aplicado
      if (valor_descuento <= 1) {
        descuentoAplicado = monto * valor_descuento; // Porcentaje
      } else {
        descuentoAplicado = valor_descuento; // Monto fijo
      }

      // Paso 4: Registrar la relación entre caja y descuento en TBL_CAJA_DESCUENTO
      await pool.query(
        'INSERT INTO tbl_caja_descuento (Cod_caja, Cod_descuento) VALUES (?, ?)',
        [nuevoCodCaja, codDescuento]
      );

      // Actualizar el monto en TBL_CAJA
      const montoFinal = Math.max(0, monto - descuentoAplicado);
      await pool.query(
        'UPDATE tbl_caja SET Monto = ? WHERE Cod_caja = ?',
        [montoFinal, nuevoCodCaja]
      );
    }

    res.status(201).json({
      message: 'Caja oficial creada exitosamente.',
      cod_caja: nuevoCodCaja,
      descuento_aplicado: descuentoAplicado,
      cod_descuento: codDescuento,
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
        c.Estado_pago = 'Pendiente'
      ORDER BY 
        c.Fecha DESC, 
        c.Hora_registro DESC
    `);

    // Si no hay resultados
    if (!cajasPendientes.length) {
      return res.status(404).json({ message: 'No se encontraron cajas pendientes.' });
    }

    // Devolver los datos al frontend
    return res.status(200).json({ data: cajasPendientes });
  } catch (error) {
    console.error('Error al obtener las cajas pendientes:', error);
    return res.status(500).json({
      message: 'Ocurrió un error al obtener las cajas pendientes.',
      error: error.message,
    });
  }
};
