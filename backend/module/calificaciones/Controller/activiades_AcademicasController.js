import conectarDB from '../../../config/db.js';
import jwt from 'jsonwebtoken';
const pool = await conectarDB();



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




// Controlador para eliminar una actividad académica
export const eliminarActividadAcademica = async (req, res) => {
    const { id } = req.params; // ID único de la actividad

    try {
        // Eliminar dependencias en tbl_actividades_asignatura
        await pool.query("DELETE FROM tbl_actividades_asignatura WHERE Cod_actividad_academica = ?", [id]);

        // Eliminar la actividad de tbl_actividades_academicas
        const [result] = await pool.query("DELETE FROM tbl_actividades_academicas WHERE Cod_actividad_academica = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Actividad no encontrada." });
        }

        res.status(200).json({ mensaje: "Actividad eliminada correctamente." });
    } catch (error) {
        console.error("Error al eliminar la actividad:", error);
        res.status(500).json({ mensaje: "Error al eliminar la actividad.", error: error.message });
    }
};
export const eliminarActividad = async (req, res) => {
    const { id } = req.params;

    try {
        // Eliminar dependencias en tbl_actividades_asignatura
        await pool.query("DELETE FROM tbl_actividades_asignatura WHERE Cod_actividad_academica = ?", [id]);

        // Eliminar la actividad
        const [result] = await pool.query("DELETE FROM tbl_actividades_academicas WHERE Cod_actividad_academica = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: "Actividad no encontrada." });
        }

        res.status(200).json({ mensaje: "Actividad eliminada correctamente." });
    } catch (error) {
        console.error("Error al eliminar la actividad:", error);
        res.status(500).json({ mensaje: "Error al eliminar la actividad.", error: error.message });
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
export const obtenerParcialesPorAsignatura = async (req, res) => {
    
    try {
    const { Cod_asignatura } = req.params;

    if (!Cod_asignatura) {
        return res.status(400).json({ mensaje: 'Falta el parámetro Cod_asignatura' });
    }

    const [parciales] = await pool.query(
        'CALL getParcialesPorSeccionAsignatura(?)',
        [Cod_asignatura]
    );

    if (parciales.length === 0) {
        return res.status(404).json({ mensaje: 'No se encontraron parciales para la asignatura' });
    }

    res.status(200).json(parciales[0]);
} catch (error) {
    console.error('Error al obtener los parciales:', error);
    res.status(500).json({ mensaje: 'Error al obtener los parciales' });
}
};
export const obtenerActividadesPorParcialAsignatura = async (req, res) => {
    try {
        const { Cod_seccion_asignatura, CodParcial } = req.params;

        // Validar que se reciban los parámetros necesarios
        if (!Cod_seccion_asignatura || !CodParcial) {
            return res.status(400).json({ mensaje: 'Faltan parámetros necesarios (Cod_seccion_asignatura o CodParcial)' });
        }

        // Llamar al procedimiento almacenado con los parámetros
        const [result] = await pool.query(
            'CALL getActividadesPorParcialAsignatura(?, ?)',
            [Cod_seccion_asignatura, CodParcial]
        );

        // Verificar si hay resultados
        const actividades = result[0]; // Extraer el array de actividades
        if (!actividades || actividades.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron actividades para este parcial y asignatura' });
        }

        // Devolver las actividades
        res.status(200).json(actividades);
    } catch (error) {
        console.error('Error al obtener actividades:', error);
        res.status(500).json({ mensaje: 'Error al obtener las actividades' });
    }
};
  
export const obtenerActividadesPorFiltro = async (req, res) => {
    try {
        const { codSeccion, codParcial, codAsignatura } = req.query;

        if (!codSeccion || !codParcial || !codAsignatura) {
            return res.status(400).json({
                mensaje: 'Faltan parámetros requeridos.',
                detalles: {
                    codSeccion: codSeccion || 'Faltante',
                    codParcial: codParcial || 'Faltante',
                    codAsignatura: codAsignatura || 'Faltante',
                },
            });
        }

        let codPersona;
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (!token) {
                return res.status(401).json({ mensaje: 'Token no proporcionado.' });
            }
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            codPersona = decodedToken.cod_persona;
        } catch (error) {
            return res.status(401).json({
                mensaje: 'Token no válido o expirado.',
                detalles: error.message,
            });
        }

        const [profesor] = await pool.query(
            'SELECT Cod_Profesor FROM tbl_profesores WHERE Cod_Persona = ?',
            [codPersona]
        );

        if (!profesor.length) {
            return res.status(404).json({
                mensaje: 'No se encontró un profesor asociado al código de persona.',
                detalles: { codPersona },
            });
        }

        const codProfesor = profesor[0].Cod_Profesor;

        // Procedimiento almacenado
        const [actividades] = await pool.query(
            'CALL obtener_actividades_por_filtro(?, ?, ?, ?)',
            [codProfesor, codSeccion, codParcial, codAsignatura]
        );

        // Devuelve un arreglo vacío si no hay actividades
        res.status(200).json(actividades[0] || []);
    } catch (error) {
        console.error('Error al obtener actividades:', error);
        res.status(500).json({
            mensaje: 'Error al obtener actividades.',
            detalles: {
                mensaje: error.message,
                stack: error.stack,
            },
        });
    }
};




export const obtenerPonderacionesPorProfesor = async (req, res) => {
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

        // Llamar al procedimiento almacenado para obtener las ponderaciones
        const [ponderaciones] = await pool.query('CALL ObtenerPonderacionesPorProfesor(?)', [codPersona]);

        if (ponderaciones.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron ponderaciones para el profesor' });
        }

        res.status(200).json(ponderaciones[0]); // Accede a la primera parte del resultado
    } catch (error) {
        console.error('Error al obtener las ponderaciones:', error);
        res.status(500).json({ mensaje: 'Error al obtener las ponderaciones' });
    }
};



  

// Controlador para actualizar una actividad académica
export const actualizarActividad = async (req, res) => {
    const { id } = req.params; // ID único de la actividad
    const {
        Nombre_actividad_academica,
        Descripcion,
        Fechayhora_Inicio,
        Fechayhora_Fin,
        Valor
    } = req.body;

    try {
        // Validar campos obligatorios
        if (!id || !Nombre_actividad_academica || !Valor) {
            return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
        }

        // Actualizar solo la actividad correspondiente al ID
        await pool.query(
            'UPDATE tbl_actividades_academicas SET Nombre_actividad_academica = ?, Descripcion = ?, Fechayhora_Inicio = ?, Fechayhora_Fin = ?, Valor = ? WHERE Cod_actividad_academica = ?',
            [Nombre_actividad_academica, Descripcion, Fechayhora_Inicio, Fechayhora_Fin, Valor, id]
        );

        res.status(200).json({ mensaje: 'Actividad actualizada correctamente' });
    } catch (error) {
        console.error('Error al actualizar la actividad:', error);
        res.status(500).json({ mensaje: 'Error al actualizar la actividad', error: error.message });
    }
};









// Obtener el total de valores por Cod_ponderacion_ciclo y Cod_ciclo
export const obtenerValoresPorPonderacionCiclo = async (req, res) => {
    try {
        const { Cod_ponderacion_ciclo, Cod_ciclo, Cod_seccion_asignatura, Cod_parcial } = req.query;

        // Validar parámetros
        if (!Cod_ponderacion_ciclo || !Cod_ciclo || !Cod_seccion_asignatura || !Cod_parcial) {
            return res.status(400).json({
                mensaje: "Parámetros insuficientes. Se requieren Cod_ponderacion_ciclo, Cod_ciclo, Cod_seccion_asignatura y Cod_parcial.",
            });
        }

        // Verificar si existe la ponderación
        const [ponderacion] = await pool.query(
            `SELECT Valor FROM tbl_ponderaciones_ciclos WHERE Cod_ponderacion_ciclo = ? AND Cod_ciclo = ?`,
            [Cod_ponderacion_ciclo, Cod_ciclo]
        );

        if (!ponderacion || ponderacion.length === 0) {
            return res.status(404).json({ mensaje: "No se encontró la ponderación especificada." });
        }

        const valorMaximo = ponderacion[0].Valor;

        // Sumar el valor actual de las actividades, considerando sección, asignatura y parcial
        const [actividades] = await pool.query(
            `SELECT SUM(a.Valor) AS totalValor
             FROM tbl_actividades_academicas a
             WHERE a.Cod_ponderacion_ciclo = ?
               AND a.Cod_seccion_asignatura = ?
               AND a.Cod_parcial = ?`,
            [Cod_ponderacion_ciclo, Cod_seccion_asignatura, Cod_parcial]
        );

        const valorActual = actividades[0].totalValor || 0;
        const disponible = valorMaximo - valorActual;

        res.json({ valorMaximo, valorActual, disponible });
    } catch (error) {
        console.error("Error al obtener valores:", error);
        res.status(500).json({ mensaje: "Error al obtener valores de actividades." });
    }
};




export const validarValorActividad = async (req, res) => {
    const { Cod_ponderacion_ciclo, Cod_seccion_asignatura, Cod_parcial, Valor } = req.body;

    try {
        // Obtener maxValor desde tbl_ponderaciones_ciclos
        const [ponderacion] = await pool.query(
            `SELECT Valor AS maxValor FROM tbl_ponderaciones_ciclos WHERE Cod_ponderacion_ciclo = ?`,
            [Cod_ponderacion_ciclo]
        );

        if (ponderacion.length === 0) {
            return res.status(400).json({
                mensaje: "No se encontró la ponderación especificada.",
            });
        }

        const maxValor = parseFloat(ponderacion[0].maxValor);

        // Obtener totalValor desde las actividades académicas filtrando por parcial
        const [actividades] = await pool.query(
            `
            SELECT IFNULL(SUM(a.Valor), 0) AS totalValor 
            FROM tbl_actividades_academicas a
            INNER JOIN tbl_actividades_asignatura aa ON a.Cod_actividad_academica = aa.Cod_actividad_academica
            WHERE a.Cod_ponderacion_ciclo = ?
              AND aa.Cod_seccion_asignatura = ?
              AND a.Cod_parcial = ?
            `,
            [Cod_ponderacion_ciclo, Cod_seccion_asignatura, Cod_parcial]
        );

        const totalValor = parseFloat(actividades[0].totalValor);

        // Validación directa del valor de la actividad
        const nuevoValor = parseFloat(Valor);
        if (nuevoValor > maxValor) {
            return res.status(400).json({
                mensaje: `El valor de la actividad no puede exceder el máximo permitido (${maxValor.toFixed(2)}). Intentaste agregar: ${nuevoValor.toFixed(2)}.`,
            });
        }

        // Validación acumulativa dentro del parcial
        if (totalValor + nuevoValor > maxValor) {
            return res.status(400).json({
                mensaje: `El valor total excede el máximo permitido para esta ponderación en este parcial. 
                Total actual: ${totalValor.toFixed(2)}, Intentaste agregar: ${nuevoValor.toFixed(2)}, Máximo permitido: ${maxValor.toFixed(2)}.`,
            });
        }

        // Si pasa todas las validaciones
        res.status(200).json({ mensaje: "Validación exitosa." });
    } catch (error) {
        console.error("Error en la validación del valor:", error);
        res.status(500).json({ mensaje: "Error en la validación del valor." });
    }
};


export const validarYActualizarActividad = async (req, res) => {
    const { Cod_actividad_academica, Cod_ponderacion_ciclo, Cod_seccion_asignatura, Cod_parcial, Valor } = req.body;

    try {
        // 1. Obtener el valor máximo permitido para la ponderación
        const [ponderacion] = await pool.query(
            `SELECT Valor AS maxValor FROM tbl_ponderaciones_ciclos WHERE Cod_ponderacion_ciclo = ?`,
            [Cod_ponderacion_ciclo]
        );

        if (ponderacion.length === 0) {
            return res.status(400).json({
                mensaje: "No se encontró la ponderación especificada.",
            });
        }

        const maxValor = parseFloat(ponderacion[0].maxValor); // Valor máximo de la ponderación, por ejemplo, 40%

        // 2. Obtener el total acumulado de las actividades en la misma ponderación, excluyendo la actividad actual
        const [actividades] = await pool.query(
            `
            SELECT IFNULL(SUM(a.Valor), 0) AS totalValor
            FROM tbl_actividades_academicas a
            INNER JOIN tbl_actividades_asignatura aa ON a.Cod_actividad_academica = aa.Cod_actividad_academica
            WHERE a.Cod_ponderacion_ciclo = ?
              AND aa.Cod_seccion_asignatura = ?
              AND a.Cod_parcial = ?
              AND a.Cod_actividad_academica != ?`, // Excluimos la actividad que se va a actualizar
            [Cod_ponderacion_ciclo, Cod_seccion_asignatura, Cod_parcial, Cod_actividad_academica]
        );

        const totalValorExistente = parseFloat(actividades[0].totalValor); // Suma de las actividades existentes (sin incluir la actual)

        // 3. Verificar que el nuevo valor no exceda el espacio restante
        const nuevoValor = parseFloat(Valor); // Nuevo valor propuesto para la actividad

        // 4. Calcular el espacio restante en la ponderación
        const ponderacionRestante = maxValor - totalValorExistente;

        if (nuevoValor > ponderacionRestante) {
            return res.status(400).json({
                mensaje: `No puedes asignar más de ${ponderacionRestante.toFixed(2)}% a esta actividad. Actualmente, ya tienes ${totalValorExistente.toFixed(2)}% asignado a otras actividades. El valor total disponible es ${ponderacionRestante.toFixed(2)}%.`,
            });
        }

        // 5. Si pasa la validación, actualizar la actividad
        await pool.query(
            `
            UPDATE tbl_actividades_academicas
            SET Valor = ?
            WHERE Cod_actividad_academica = ?`,
            [nuevoValor, Cod_actividad_academica]
        );

        res.status(200).json({ mensaje: "Actividad actualizada exitosamente." });
    } catch (error) {
        console.error("Error en la validación de actualización:", error);
        res.status(500).json({ mensaje: "Error interno del servidor." });
    }
};




























// Backend Controller
export const obtenerCantidadActividadesPorParcial = async (req, res) => {
    const { Cod_secciones, Cod_profesor, Cod_seccion_asignatura } = req.query;
  
    try {
      const [rows] = await pool.query(
        `CALL ObtenerCantidadActividadesPorParcial(?, ?, ?)`,
        [Cod_secciones, Cod_profesor, Cod_seccion_asignatura]
      );
  
      res.json(rows[0]); // Retorna los resultados
    } catch (error) {
      console.error("Error al obtener el conteo de actividades por parcial:", error);
      res.status(500).json({ mensaje: "Error al obtener el conteo de actividades" });
    }
  };
