
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

// Controlador para crear una nueva actividad extracurricular
export const crearActividadesExtra = async (req, res) => {
    const { p_Nombre, p_Descripcion, p_Hora_inicio, p_Hora_final, p_Nombre_seccion, p_Fecha } = req.body;

    try {
        // Verifica que se proporcionen todos los parámetros requeridos
        if (!p_Nombre || !p_Descripcion || !p_Hora_inicio || !p_Hora_final || !p_Nombre_seccion || !p_Fecha) {
            return res.status(400).json({ mensaje: "Todos los campos son requeridos." });
        }

        // Llama al procedimiento almacenado para insertar la actividad
        const [result] = await pool.query(
            'CALL sp_insertar_actividad_extracurricular(?, ?, ?, ?, ?, ?)', 
            [p_Nombre, p_Descripcion, p_Hora_inicio, p_Hora_final, p_Nombre_seccion, p_Fecha]
        );

        // Responde con un mensaje de éxito
        return res.status(201).json({ mensaje: "Actividad extracurricular insertada con éxito", data: result });
    } catch (error) {
        console.error('Error al insertar la actividad extracurricular:', error);
        return res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};


// Controlador para actualizar una actividad extracurricular
export const actualizarActividadesExtra = async (req, res) => {
    const { p_Cod_actividad, p_Nombre, p_Descripcion, p_Hora_inicio, p_Hora_final, p_Nombre_seccion, p_Fecha } = req.body;

    try {
        // Verifica que se proporcionen todos los parámetros requeridos
        if (!p_Cod_actividad || !p_Nombre || !p_Descripcion || !p_Hora_inicio || !p_Hora_final || !p_Nombre_seccion || !p_Fecha) {
            return res.status(400).json({ mensaje: "Todos los campos son requeridos." });
        }

        // Llama al procedimiento almacenado para actualizar la actividad
        const [result] = await pool.query('CALL sp_actualizar_actividad_extracurricular(?, ?, ?, ?, ?, ?, ?)', [
            p_Cod_actividad,
            p_Nombre,
            p_Descripcion,
            p_Hora_inicio,
            p_Hora_final,
            p_Nombre_seccion,
            p_Fecha,
        ]);

        // Responde con un mensaje de éxito
        return res.status(200).json({ mensaje: 'Actividad extracurricular actualizada correctamente.', data: result });
    } catch (error) {
        console.error('Error al actualizar la actividad extracurricular:', error);

        // Si el error es personalizado del procedimiento almacenado
        if (error.sqlState === '45000') {
            return res.status(400).json({ mensaje: error.message });
        }

        // Otros errores de servidor
        return res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};


// Controlador para cambiar el estado de una actividad extracurricular
export const cambiarEstadoActividad = async (req, res) => {
    const { p_Cod_actividades_extracurriculares, p_Estado } = req.body;

    try {
        // Validar que se reciban los parámetros necesarios
        if (!p_Cod_actividades_extracurriculares || !p_Estado) {
            return res.status(400).json({ mensaje: 'Todos los campos son requeridos.' });
        }

        // Validar que el estado sea válido ("Activa" o "Cancelada")
        if (!['Activa', 'Cancelada'].includes(p_Estado)) {
            return res.status(400).json({ mensaje: 'Estado no válido. Debe ser "Activa" o "Cancelada".' });
        }

        // Llamar al procedimiento almacenado para cambiar el estado
        const [result] = await pool.query(
            'CALL sp_cambiar_estado_actividad(?, ?)',
            [p_Cod_actividades_extracurriculares, p_Estado]
        );

        // Responder con éxito
        return res.status(200).json({ mensaje: `Estado de la actividad actualizado a ${p_Estado}.`, data: result });
    } catch (error) {
        console.error('Error al cambiar el estado de la actividad extracurricular:', error);

        // Si el error es personalizado (proveniente del procedimiento almacenado)
        if (error.sqlState === '45000') {
            return res.status(400).json({ mensaje: error.message });
        }

        // Otros errores de servidor
        return res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
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

// Controlador para obtener las secciones
export const obtenerSecciones = async (req, res) => {
    try {
        // Obtenemos el parámetro 'Cod_secciones' de la solicitud
        const { Cod_secciones } = req.params;

        // Llamamos al procedimiento almacenado con el parámetro
        const [rows] = await pool.query('CALL sp_obtener_secciones(?)', [Cod_secciones]);

        // Verificamos si se encontraron resultados
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


export const obtenerPadresYGradosSecciones = async (req, res) => {
    try {
        // Paso 1: Llamar al procedimiento almacenado para obtener los padres
        console.log("Ejecutando sp_usuariosRol1ActividadesExtra...");
        const [padres] = await pool.query('CALL sp_usuariosRol1ActividadesExtra()');

        // Verificar si se encontraron padres
        console.log("Resultado de sp_usuariosRol1ActividadesExtra:", padres[0]);
        if (padres[0].length === 0) {
            console.warn("No se encontraron padres en el primer procedimiento.");
            return res.status(404).json({ message: 'No se encontraron padres de estudiantes' });
        }

        // Array para almacenar la información combinada
        const resultados = [];

        // Paso 2: Iterar sobre cada padre para buscar a sus estudiantes
        for (const padre of padres[0]) {
            const { cod_persona: codPersonaPadre } = padre;
            console.log(`Procesando padre con cod_persona: ${codPersonaPadre}`);

            // Buscar estudiantes relacionados con el padre en tbl_estructura_familiar
            console.log(`Buscando estudiantes para el padre ${codPersonaPadre} en tbl_estructura_familiar...`);
            const [estudiantes] = await pool.query(
                `SELECT cod_persona_estudiante 
                 FROM tbl_estructura_familiar 
                 WHERE cod_persona_padre = ?`,
                [codPersonaPadre]
            );

            console.log(`Estudiantes encontrados para el padre ${codPersonaPadre}:`, estudiantes);
            if (estudiantes.length === 0) {
                console.warn(`No se encontraron estudiantes para el padre con cod_persona ${codPersonaPadre}.`);
                continue; // Pasar al siguiente padre
            }

            // Paso 3: Buscar grados y secciones de cada estudiante
            for (const estudiante of estudiantes) {
                const { cod_persona_estudiante: codPersonaEstudiante } = estudiante;
                console.log(`Buscando grados y secciones para el estudiante con cod_persona: ${codPersonaEstudiante}`);

                // Llamar al procedimiento para obtener grados y secciones
                const [gradoSeccion] = await pool.query(
                    'CALL GetGradoSeccionYPadre(?)',
                    [codPersonaEstudiante]
                );

                console.log(`Resultado de GetGradoSeccionYPadre para el estudiante ${codPersonaEstudiante}:`, gradoSeccion[0]);
                if (gradoSeccion[0].length === 0) {
                    console.warn(`No se encontraron grados y secciones para el estudiante ${codPersonaEstudiante}.`);
                    continue; // Pasar al siguiente estudiante
                }

                // Combinar información del padre, estudiante, grado y sección
                for (const seccion of gradoSeccion[0]) {
                    resultados.push({
                        nombre_completo_padre: padre.nombre_completo,
                        correo_usuario: padre.correo_usuario,
                        cod_persona_padre: codPersonaPadre,
                        cod_persona_estudiante: codPersonaEstudiante,
                        cod_grado: seccion.cod_grado,
                        cod_seccion: seccion.cod_seccion,
                        nombre_padre: seccion.nombre_padre,
                    });
                }
            }
        }

        // Verificar si hay resultados combinados
        if (resultados.length > 0) {
            console.log("Resultados finales:", resultados);
            res.status(200).json(resultados);
        } else {
            console.warn("No se encontraron grados y secciones para los estudiantes de los padres.");
            res.status(404).json({
                message: 'No se encontraron grados y secciones para los estudiantes de los padres',
            });
        }
    } catch (error) {
        console.error('Error al obtener la información:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};


export const notificarNuevaActividad = async (req, res) => {
    try {
        // Parámetros enviados desde la solicitud (por ejemplo, cod_seccion y actividad)
        const { cod_seccion } = req.params; // Sección que queremos filtrar
        const { nombre, fecha, hora, lugar, descripcion } = req.body.actividad; // Detalles de la actividad

        // Paso 1: Obtener los padres relacionados con la sección
        console.log(`Buscando padres de la sección ${cod_seccion}...`);
        const [padres] = await pool.query('CALL sp_usuariosRol1ActividadesExtra()');

        if (padres[0].length === 0) {
            return res.status(404).json({ message: 'No se encontraron padres en esta sección' });
        }

        // Paso 2: Buscar estudiantes relacionados y filtrar por sección
        const resultados = [];

        for (const padre of padres[0]) {
            const { cod_persona: codPersonaPadre, nombre_completo, correo_usuario } = padre;

            // Buscar estudiantes relacionados con el padre
            const [estudiantes] = await pool.query(
                `SELECT cod_persona_estudiante 
                 FROM tbl_estructura_familiar 
                 WHERE cod_persona_padre = ?`,
                [codPersonaPadre]
            );

            for (const estudiante of estudiantes) {
                const { cod_persona_estudiante: codPersonaEstudiante } = estudiante;

                // Buscar grado y sección del estudiante
                const [gradoSeccion] = await pool.query(
                    'CALL GetGradoSeccionYPadre(?)',
                    [codPersonaEstudiante]
                );

                for (const seccion of gradoSeccion[0]) {
                    // Filtrar por la sección proporcionada
                    if (seccion.cod_seccion === parseInt(cod_seccion)) {
                        resultados.push({
                            correo_padre: correo_usuario,
                            nombre_padre: nombre_completo,
                        });
                    }
                }
            }
        }

        if (resultados.length === 0) {
            return res.status(404).json({ message: 'No se encontraron padres relacionados con esta sección' });
        }

        // Paso 3: Enviar correos a los padres
        console.log('Enviando correos a los padres...');
        for (const resultado of resultados) {
            await enviarNotificacionNuevaActividad(resultado.correo_padre, resultado.nombre_padre, {
                nombre,
                fecha,
                hora,
                lugar,
                descripcion,
            });
        }

        // Respuesta de éxito
        res.status(200).json({ message: 'Notificaciones enviadas correctamente a los padres' });
    } catch (error) {
        console.error('Error al enviar notificaciones:', error);
        res.status(500).json({ message: 'Error al enviar notificaciones', error: error.message });
    }
};

export const notificarCancelacionActividad = async (req, res) => {
    try {
        // Obtener los datos de la solicitud
        const { cod_seccion } = req.params; // Código de la sección (de la URL)
        const { actividad, motivo } = req.body; // Datos de la actividad y motivo (del cuerpo)

        const { nombre, fecha, hora, lugar } = actividad; // Detalles de la actividad cancelada

        // Paso 1: Obtener los padres relacionados con la sección
        console.log(`Buscando padres de la sección ${cod_seccion}...`);
        const [padres] = await pool.query('CALL sp_usuariosRol1ActividadesExtra()');

        if (padres[0].length === 0) {
            return res.status(404).json({ message: 'No se encontraron padres en esta sección' });
        }

        // Paso 2: Buscar estudiantes relacionados y filtrar por sección
        const resultados = [];

        for (const padre of padres[0]) {
            const { cod_persona: codPersonaPadre, nombre_completo, correo_usuario } = padre;

            // Buscar estudiantes relacionados con el padre
            const [estudiantes] = await pool.query(
                `SELECT cod_persona_estudiante 
                 FROM tbl_estructura_familiar 
                 WHERE cod_persona_padre = ?`,
                [codPersonaPadre]
            );

            for (const estudiante of estudiantes) {
                const { cod_persona_estudiante: codPersonaEstudiante } = estudiante;

                // Buscar grado y sección del estudiante
                const [gradoSeccion] = await pool.query(
                    'CALL GetGradoSeccionYPadre(?)',
                    [codPersonaEstudiante]
                );

                for (const seccion of gradoSeccion[0]) {
                    // Filtrar por la sección proporcionada
                    if (seccion.cod_seccion === parseInt(cod_seccion)) {
                        resultados.push({
                            correo_padre: correo_usuario,
                            nombre_padre: nombre_completo,
                        });
                    }
                }
            }
        }

        if (resultados.length === 0) {
            return res.status(404).json({ message: 'No se encontraron padres relacionados con esta sección' });
        }

        // Paso 3: Enviar correos de cancelación a los padres
        console.log('Enviando correos de cancelación a los padres...');
        for (const resultado of resultados) {
            await enviarNotificacionCancelacionActividad(
                resultado.correo_padre,
                resultado.nombre_padre,
                { nombre, fecha, hora, lugar },
                motivo
            );
        }

        // Responder con éxito
        res.status(200).json({ message: 'Notificaciones de cancelación enviadas correctamente a los padres' });
    } catch (error) {
        console.error('Error al enviar notificaciones de cancelación:', error);
        res.status(500).json({ message: 'Error al enviar notificaciones de cancelación', error: error.message });
    }
};


export const notificarCambioActividad = async (req, res) => {
    try {
        // Parámetros enviados desde la solicitud
        const { cod_seccion } = req.params; // Código de la sección (de la URL)
        const { actividad_anterior, actividad_actual } = req.body; // Detalles de la actividad anterior y actual (del cuerpo)

        // Paso 1: Obtener los padres relacionados con la sección
        console.log(`Buscando padres de la sección ${cod_seccion}...`);
        const [padres] = await pool.query('CALL sp_usuariosRol1ActividadesExtra()');

        if (padres[0].length === 0) {
            return res.status(404).json({ message: 'No se encontraron padres en esta sección' });
        }

        // Paso 2: Buscar estudiantes relacionados y filtrar por sección
        const resultados = [];

        for (const padre of padres[0]) {
            const { cod_persona: codPersonaPadre, nombre_completo, correo_usuario } = padre;

            // Buscar estudiantes relacionados con el padre
            const [estudiantes] = await pool.query(
                `SELECT cod_persona_estudiante 
                 FROM tbl_estructura_familiar 
                 WHERE cod_persona_padre = ?`,
                [codPersonaPadre]
            );

            for (const estudiante of estudiantes) {
                const { cod_persona_estudiante: codPersonaEstudiante } = estudiante;

                // Buscar grado y sección del estudiante
                const [gradoSeccion] = await pool.query(
                    'CALL GetGradoSeccionYPadre(?)',
                    [codPersonaEstudiante]
                );

                for (const seccion of gradoSeccion[0]) {
                    // Filtrar por la sección proporcionada
                    if (seccion.cod_seccion === parseInt(cod_seccion)) {
                        resultados.push({
                            correo_padre: correo_usuario,
                            nombre_padre: nombre_completo,
                        });
                    }
                }
            }
        }

        if (resultados.length === 0) {
            return res.status(404).json({ message: 'No se encontraron padres relacionados con esta sección' });
        }

        // Paso 3: Enviar correos de actualización a los padres
        console.log('Enviando correos de actualización a los padres...');
        for (const resultado of resultados) {
            await enviarNotificacionCambioActividad(
                resultado.correo_padre,
                resultado.nombre_padre,
                actividad_anterior,
                actividad_actual
            );
        }

        // Responder con éxito
        res.status(200).json({ message: 'Notificaciones de actualización enviadas correctamente a los padres' });
    } catch (error) {
        console.error('Error al enviar notificaciones de actualización:', error);
        res.status(500).json({ message: 'Error al enviar notificaciones de actualización', error: error.message });
    }
};

