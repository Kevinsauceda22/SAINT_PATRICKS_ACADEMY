
import conectarDB from '../../../config/db.js';
import { enviarNotificacionNuevaActividad,
         enviarNotificacionCancelacionActividad,
         enviarNotificacionCambioActividad} from '../../../helpers/emailHelper.js';

const pool = await conectarDB();

// Controlador para obtener actividades extracurriculares
export const obtenerActividadesExtra = async (req, res) => {
    const { Cod_actividades_extracurriculares } = req.params;

    try {
        let query;
        let params;

        if (Cod_actividades_extracurriculares) {
            query = 'CALL sp_obtener_actividad_extracurricular(?)';
            params = [Cod_actividades_extracurriculares];
        } else {
            query = 'CALL sp_obtener_actividad_extracurricular(?)';
            params = [0];
        }

        const [rows] = await pool.query(query, params);

        if (!rows || rows[0].length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron actividades extracurriculares.' });
        }

        res.status(200).json(rows[0]); // Asegúrate de enviar toda la información, incluido Nombre_seccion
    } catch (error) {
        console.error('Error al obtener las actividades extracurriculares:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};
export const crearActividadesExtra = async (req, res) => {
    const { p_Nombre, p_Descripcion, p_Hora_inicio, p_Hora_final, Cod_secciones, p_Fecha } = req.body;

    try {
        // Convertir el nombre y la descripción a mayúsculas
        const nombreMayusculas = p_Nombre.toUpperCase();
        const descripcionMayusculas = p_Descripcion.toUpperCase();

        // Validar que Cod_secciones sea un número
        if (!Cod_secciones || isNaN(parseInt(Cod_secciones))) {
            return res.status(400).json({
                mensaje: 'El valor de Cod_secciones es inválido. Debe ser un número.',
            });
        }

        // Convertir Cod_secciones a número
        const codSeccion = parseInt(Cod_secciones);

        // Insertar la actividad extracurricular
        const [result] = await pool.query(
            'CALL sp_insertar_actividad_extracurricular(?, ?, ?, ?, ?, ?)',
            [nombreMayusculas, descripcionMayusculas, p_Hora_inicio, p_Hora_final, codSeccion, p_Fecha]
        );

        console.log('Actividad extracurricular creada con éxito:', result);

        if (result.affectedRows === 0) {
            return res.status(500).json({
                mensaje: 'No se pudo crear la actividad.',
                error: 'La operación no afectó filas.',
            });
        }

        // Preparar datos de la actividad para la notificación (ya en mayúsculas)
        const actividad = {
            nombre: nombreMayusculas,
            descripcion: descripcionMayusculas,
            fecha: p_Fecha,
            hora: `${p_Hora_inicio} - ${p_Hora_final}`,
        };

        // Obtener la lista de padres y grados/secciones relacionados con la sección
        console.log(`Obteniendo padres y grados para la sección ${codSeccion}...`);
        const padresYSecciones = await obtenerPadresYGradosSecciones(codSeccion);

        if (padresYSecciones.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron padres relacionados con esta sección.' });
        }

        // Enviar notificaciones a los padres
        console.log('Enviando correos a los padres...');
        for (const padre of padresYSecciones) {
            // Incluir grado y sección en los datos de la notificación
            const actividadConSeccionYGrado = {
                ...actividad,
                nombre_grado: padre.nombre_grado,  // Nombre del grado
                nombre_seccion: padre.nombre_seccion,  // Nombre de la sección
            };
            console.log('Datos de la actividad:', actividadConSeccionYGrado);

            await enviarNotificacionNuevaActividad(padre.correo_usuario, padre.nombre_completo_padre, actividadConSeccionYGrado);
        }

        return res.status(201).json({
            mensaje: 'Actividad creada y notificaciones enviadas correctamente.',
        });
    } catch (error) {
        console.error('Error al crear la actividad extracurricular:', error);

        // Identificar si el error viene de MySQL y devolver el detalle al cliente
        if (error.code === 'ER_SIGNAL_EXCEPTION' || error.sqlState === '45000') {
            return res.status(400).json({
                mensaje: 'Error al crear la actividad extracurricular.',
                detalle: error.sqlMessage, // Enviar el mensaje de error específico
            });
        }

        // Para cualquier otro tipo de error
        return res.status(500).json({
            mensaje: 'Error inesperado al crear la actividad extracurricular.',
            error: error.message,
        });
    }
};


// Controlador para actualizar una actividad extracurricular
export const actualizarActividadesExtra = async (req, res) => {
    const {
        p_Cod_actividad,
        p_Nombre,
        p_Descripcion,
        p_Hora_inicio,
        p_Hora_final,
        p_Nombre_seccion,
        p_Fecha,
    } = req.body;

    try {
        // Verifica que se proporcionen todos los parámetros requeridos
        if (
            !p_Cod_actividad ||
            !p_Nombre ||
            !p_Descripcion ||
            !p_Hora_inicio ||
            !p_Hora_final ||
            !p_Nombre_seccion ||
            !p_Fecha
        ) {
            return res.status(400).json({ mensaje: "Todos los campos son requeridos." });
        }

        // Convertir el nombre y la descripción a mayúsculas
        const nombreMayusculas = p_Nombre.toUpperCase();
        const descripcionMayusculas = p_Descripcion.toUpperCase();

        // Llamar al procedimiento almacenado para actualizar la actividad
        const [result] = await pool.query(
            "CALL sp_actualizar_actividad_extracurricular(?, ?, ?, ?, ?, ?, ?)",
            [
                p_Cod_actividad,
                nombreMayusculas,
                descripcionMayusculas,
                p_Hora_inicio,
                p_Hora_final,
                p_Nombre_seccion,
                p_Fecha,
            ]
        );

        // Verificar si la actualización afectó alguna fila
        if (result.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "No se pudo actualizar la actividad. Verifique los datos enviados.",
            });
        }

        console.log("Actividad extracurricular actualizada con éxito:", result);

        // Obtener el código de la sección asociada al `p_Nombre_seccion`
        const [codSeccionResult] = await pool.query(
            "SELECT s.Cod_secciones, g.Nombre_grado FROM tbl_secciones s JOIN tbl_grados g ON s.Cod_grado = g.Cod_grado WHERE s.Nombre_seccion = ? LIMIT 1",
            [p_Nombre_seccion]
        );

        if (codSeccionResult.length === 0) {
            return res
                .status(404)
                .json({ mensaje: "La sección especificada no existe." });
        }

        const { Cod_secciones: codSeccion, Nombre_grado: nombreGrado } = codSeccionResult[0];

        const actividadActual = {
            nombre: nombreMayusculas,
            descripcion: descripcionMayusculas,
            fecha: p_Fecha,
            hora: `${p_Hora_inicio} - ${p_Hora_final}`,
            seccion: p_Nombre_seccion,
            grado: nombreGrado,
        };

        // Obtener la lista de padres relacionados con la sección
        console.log(`Obteniendo padres para la sección ${codSeccion}...`);
        const padresYSecciones = await obtenerPadresYGradosSecciones(codSeccion);

        if (padresYSecciones.length === 0) {
            return res
                .status(404)
                .json({ mensaje: "No se encontraron padres relacionados con esta sección." });
        }

        // Enviar notificaciones de actualización a los padres
        console.log("Enviando correos a los padres sobre la actualización...");
        for (const padre of padresYSecciones) {
            await enviarNotificacionCambioActividad(
                padre.correo_usuario,
                padre.nombre_completo_padre,
                actividadActual
            );
        }

        // Responder con éxito
        return res.status(200).json({
            mensaje: "Actividad actualizada y notificaciones enviadas correctamente.",
        });
    } catch (error) {
        console.error(
            "Error al actualizar la actividad extracurricular y enviar notificaciones:",
            error
        );

        // Manejo de errores personalizados del procedimiento almacenado
        if (error.sqlState === "45000") {
            return res.status(400).json({ mensaje: error.message });
        }

        // Otros errores de servidor
        return res.status(500).json({
            mensaje: "Error al actualizar la actividad extracurricular o enviar notificaciones.",
            error: error.message,
        });
    }
};
export const cambiarEstadoActividad = async (req, res) => {
    let { p_Cod_actividades_extracurriculares, p_Estado, p_Motivo } = req.body; // Agregar p_Motivo

    try {
        // Convertir a mayúsculas para asegurarse de que el estado y motivo estén en el formato correcto
        p_Estado = p_Estado ? p_Estado.toUpperCase() : null;
        p_Motivo = p_Motivo ? p_Motivo.toUpperCase() : null;

        // Validar parámetros
        if (!p_Cod_actividades_extracurriculares || !p_Estado) {
            return res.status(400).json({ mensaje: 'Todos los campos son requeridos.' });
        }

        // Si el estado es 'Cancelada', se valida que se haya proporcionado el motivo
        if (p_Estado === 'CANCELADA' && !p_Motivo) {
            return res.status(400).json({ mensaje: 'El motivo de la cancelación es requerido.' });
        }

        // Llamar al procedimiento para cambiar el estado
        const query = 'CALL sp_cambiar_estado_actividad(?, ?, ?, @mensaje)'; // Ahora incluimos el motivo
        await pool.query(query, [p_Cod_actividades_extracurriculares, p_Estado, p_Motivo || null]); // Pasamos el motivo al procedimiento

        // Obtener el mensaje de salida del procedimiento
        const [result] = await pool.query('SELECT @mensaje AS mensaje;');
        const mensaje = result[0].mensaje;

        // Obtener la información de la actividad para el correo
        const [actividadInfo] = await pool.query(
            'SELECT Nombre, Descripcion, Fecha, Hora_inicio, Hora_final, Cod_seccion FROM tbl_actividades_extracurriculares WHERE Cod_actividades_extracurriculares = ?',
            [p_Cod_actividades_extracurriculares]
        );

        if (!actividadInfo || actividadInfo.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontró la actividad actualizada.' });
        }

        const actividad = actividadInfo[0];
        const codSeccion = actividad.Cod_seccion;

        // Obtener el nombre del grado y la sección asociados a esta actividad
        const [gradoSeccion] = await pool.query(
            'SELECT g.Nombre_grado, s.Nombre_seccion FROM tbl_secciones s INNER JOIN tbl_grados g ON s.Cod_grado = g.Cod_grado WHERE s.Cod_secciones = ?',
            [codSeccion]
        );

        const nombreGrado = gradoSeccion.length > 0 ? gradoSeccion[0].Nombre_grado : 'No especificado';
        const nombreSeccion = gradoSeccion.length > 0 ? gradoSeccion[0].Nombre_seccion : 'No especificado';

        // Preparar datos de la actividad para el correo
        const actividadDatos = {
            nombre: actividad.Nombre || 'No especificado',
            descripcion: actividad.Descripcion || 'No especificada',
            fecha: actividad.Fecha || 'No especificada',
            hora: `${actividad.Hora_inicio || 'No especificada'} - ${actividad.Hora_final || 'No especificada'}`,
            nombre_grado: nombreGrado,
            nombre_seccion: nombreSeccion,
            motivo_cancelacion: p_Motivo || 'No especificado', // Agregar el motivo
        };

        // Obtener los padres relacionados con la sección
        const padresYSecciones = await obtenerPadresYGradosSecciones(codSeccion);

        if (padresYSecciones.length === 0) {
            console.warn(`No se encontraron padres para la sección ${codSeccion}.`);
        } else {
            // Enviar correos según el estado
            for (const padre of padresYSecciones) {
                if (p_Estado === 'CANCELADA') {
                    // Enviar notificación de cancelación
                    await enviarNotificacionCancelacionActividad(
                        padre.correo_usuario,
                        padre.nombre_completo_padre,
                        actividadDatos
                    );
                } else if (p_Estado === 'ACTIVA') {
                    // Enviar notificación de activación
                    await enviarNotificacionNuevaActividad(
                        padre.correo_usuario,
                        padre.nombre_completo_padre,
                        actividadDatos
                    );
                }
            }
        }

        // Responder con éxito
        res.status(200).json({ mensaje });
    } catch (error) {
        console.error('Error al cambiar el estado de la actividad extracurricular:', error);

        // Si es un error personalizado del procedimiento
        if (error.sqlState === '45000') {
            return res.status(400).json({ mensaje: error.message });
        }

        // Otros errores
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};








// Controlador para eliminar una actividad extracurricular
export const eliminarActividadExtracurricular = async (req, res) => {
    const { Cod_actividad } = req.params; // Asegúrate de que el nombre del parámetro coincide con lo que envías en la ruta

    try {
        // Procedimiento almacenado llamado con el código de la actividad extracurricular
        const [result] = await pool.query('CALL sp_eliminar_actividad_extracurricular(?)', [Cod_actividad]);

        // Verificar si se eliminó alguna actividad
        if (result.affectedRows > 0) {
            return res.status(200).json({ mensaje: 'Actividad extracurricular eliminada correctamente.' });
        } else {
            return res.status(404).json({ mensaje: 'No se encontró la actividad extracurricular especificada.' });
        }
    } catch (error) {
        console.error('Error al eliminar la actividad extracurricular:', error);
        // Si el error es personalizado (proveniente del procedimiento almacenado)
        if (error.sqlState === '45000') {
            return res.status(400).json({ mensaje: error.message });
        }
        // Para otros errores de servidor
        return res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

export const obtenerSecciones = async (req, res) => {
    try {
        // Obtén el parámetro 'Cod_secciones' de la solicitud, con un valor predeterminado de 0 si no está definido
        const { Cod_secciones = 0 } = req.params;

        // Llama al procedimiento almacenado con el parámetro
        const [rows] = await pool.query('CALL sp_obtener_secciones(?)', [Cod_secciones]);

        // Verifica si se encontraron resultados
        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'No se encontraron secciones' });
        }
    } catch (error) {
        console.error('Error al obtener las secciones:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};




export const obtenerPadresYGradosSecciones = async (codSeccion) => {
    try {
        // Llamar al procedimiento almacenado para obtener los padres
        console.log(`Ejecutando sp_usuariosRolActividadesExtra para la sección ${codSeccion}...`);
        const [padres] = await pool.query('CALL sp_usuariosRolActividadesExtra(?)', [codSeccion]);
        console.log(`Resultado de sp_usuariosRolActividadesExtra:`, padres);

        // Verificar si se encontraron padres
        if (padres[0].length === 0) {
            console.warn("No se encontraron padres en el primer procedimiento.");
            return [];
        }

        const resultados = [];

        // Iterar sobre cada padre para buscar a sus estudiantes
        for (const padre of padres[0]) {
            const { cod_persona: codPersonaPadre } = padre;

            // Buscar estudiantes relacionados con el padre
            const [estudiantes] = await pool.query(
                `SELECT cod_persona_estudiante 
                 FROM tbl_estructura_familiar 
                 WHERE cod_persona_padre = ?`,
                [codPersonaPadre]
            );

            if (estudiantes.length === 0) continue; // Saltar si no hay estudiantes relacionados

            // Buscar grados y secciones de cada estudiante
            for (const estudiante of estudiantes) {
                const { cod_persona_estudiante: codPersonaEstudiante } = estudiante;

                // Llamar al procedimiento para obtener grados y secciones
                const [gradoSeccion] = await pool.query(
                    'CALL GetGradoSeccionYPadre(?)',
                    [codPersonaEstudiante]
                );

                for (const seccion of gradoSeccion[0]) {
                    // Filtrar por sección proporcionada
                    if (seccion.cod_seccion === codSeccion) {
                        // Obtener el nombre del grado
                        const [grado] = await pool.query(
                            'SELECT Nombre_grado FROM tbl_grados WHERE Cod_grado = ?',
                            [seccion.cod_grado]
                        );

                        const nombreGrado = grado.length > 0 ? grado[0].Nombre_grado : 'Grado no encontrado';

                        resultados.push({
                            nombre_completo_padre: padre.nombre_completo,
                            correo_usuario: padre.correo_usuario,
                            cod_persona_padre: codPersonaPadre,
                            cod_persona_estudiante: codPersonaEstudiante,
                            cod_grado: seccion.cod_grado,
                            nombre_grado: nombreGrado,  // Nombre del grado agregado
                            cod_seccion: seccion.cod_seccion,
                            nombre_seccion: seccion.Nombre_seccion,  // Nombre de la sección agregado
                        });
                    }
                }
            }
        }

        return resultados;
    } catch (error) {
        console.error('Error al obtener la información:', error.message);
        throw new Error('Error al obtener padres, grados y secciones.');
    }
};



