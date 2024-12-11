import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


//Controlador para obtener La estructura familiar 
export const obtenerEstructuraFamiliar = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL P_Get_EstructuraFamiliar()');

        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'No se encontraron estructuras familiares' });
        }
    } catch (error) {
        console.error('Error al obtener las estructura familiar:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};



export const obtenerEstructurasFamiliares = async (req, res) => {
  try {
    const { cod_persona } = req.params; // Obtener el ID de la persona desde los parámetros de la URL

    if (!cod_persona) {
      return res.status(400).json({ error: 'El código de la persona es obligatorio.' });
    }

    // Llamada al procedimiento almacenado
    const [resultados] = await pool.query('CALL P_Get_Estructuras_Familiares(?)', [cod_persona]);

    // Verificar si hay datos
    if (resultados[0].length === 0) {
      return res.status(404).json({ message: 'No se encontraron estructuras familiares para esta persona.' });
    }

    // Responder con los datos obtenidos
    res.json(resultados[0]);
  } catch (error) {
    console.error('Error al obtener estructuras familiares:', error);
    res.status(500).json({ error: 'Error al obtener estructuras familiares.' });
  }
};



export const obtenerTipoRelacion = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL P_Get_TipoRelacion()');

        if (rows[0].length > 0) {
            // Devolver ambos campos: Cod_tipo_relacion y tipo_relacion
            const tipoRelacion = rows[0].map(tipo => ({
                Cod_tipo_relacion: tipo.Cod_tipo_relacion, // Asegúrate de que este nombre coincide con el campo de tu SP
                tipo_relacion: tipo.tipo_relacion // Este es el nombre del campo que estás usando
            }));
            res.status(200).json(tipoRelacion); // Devuelve un array de objetos con ambos valores
        } else {
            res.status(404).json({ message: 'No se encontraron tipos de relación' });
        }
    } catch (error) {
        console.error('Error al obtener los tipos de relación:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

export const obtenerPersonas = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL P_Get_Personas()');
        const personas = rows[0];

        if (personas.length > 0) {
            const resultado = personas.map(persona => ({
                cod_persona: persona.cod_persona,
                fullName: `${persona.Nombre} ${persona.Segundo_nombre || ''} ${persona.Primer_apellido} ${persona.Segundo_apellido || ''}`.trim(),
                dni_persona: persona.dni_persona, // Agregado el dni_persona
            }));
            res.status(200).json(resultado);
        } else {
            res.status(404).json({ message: 'No se encontraron personas' });
        }
    } catch (error) {
        console.error('Error al obtener las personas:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};


export const obtenerPersonasPorRol= async (req, res) => {
    const { rol } = req.params; // Obtener el rol de req.params
    const { dni, nombre } = req.query; // Obtener DNI y nombre de los parámetros de consulta

    try {
        let personas = [];
        let query = 'SELECT cod_persona, Nombre, Segundo_nombre, Primer_apellido, Segundo_Apellido FROM tbl_personas WHERE Cod_tipo_persona = ?';
        let params = [parseInt(rol)]; // Asegúrate de que rol sea un número si es necesario

        // Añadir filtro por DNI si se proporciona
        if (dni) {
            query += ' AND DNI = ?'; // Asegúrate de que el campo DNI existe en tu tabla
            params.push(dni);
        }

        // Añadir filtro por nombre si se proporciona
        if (nombre) {
            query += ' AND (Nombre LIKE ? OR Segundo_nombre LIKE ? OR Primer_apellido LIKE ? OR Segundo_Apellido LIKE ?)';
            const nombreWildcard = `%${nombre}%`; // Utiliza wildcards para buscar coincidencias parciales
            params.push(nombreWildcard, nombreWildcard, nombreWildcard, nombreWildcard);
        }

        const [rows] = await pool.query(query, params);
        personas = rows;

        if (personas.length > 0) {
            const resultado = personas.map(persona => ({
                cod_persona: persona.cod_persona,
                fullName: `${persona.Nombre} ${persona.Segundo_nombre || ''} ${persona.Primer_apellido} ${persona.Segundo_Apellido || ''}`.trim(),
            }));
            res.status(200).json(resultado);
        } else {
            res.status(404).json({ message: 'No se encontraron personas para este rol' });
        }
    } catch (error) {
        console.error('Error al obtener las personas:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};


//Controlador para crear 
export const crearEstructuraFamiliar = async (req, res) => {
    const {
        cod_persona_estudiante,
        cod_persona_padre,
        cod_tipo_relacion,
        descripcion,
    } = req.body;

    try {
        // Convertir a mayúsculas el valor de cod_tipo_relacion para la validación
        const tipoRelacion = cod_tipo_relacion.toUpperCase(); // Asegurarse de que esté en mayúsculas

        // Solo validar para "PADRE" o "MADRE"
        if (tipoRelacion === "PADRE" || tipoRelacion === "MADRE") {
            // Verificar si ya existe un registro con el mismo tipo de relación para el mismo estudiante
            const [resultado] = await pool.query(
                'SELECT COUNT(*) AS total FROM tbl_estructura_familiar WHERE cod_persona_estudiante = ? AND cod_tipo_relacion = ?',
                [cod_persona_estudiante, tipoRelacion]
            );

            if (resultado[0].total > 0) {
                return res.status(400).json({
                    mensaje: `El estudiante ya tiene registrado como ${tipoRelacion}. No se puede agregar otro.`,
                });
            }
        }

        // Si no hay conflicto, continuar con la inserción
        await pool.query('CALL P_Post_EstructuraFamiliar(?, ?, ?, ?)', [
            cod_persona_estudiante,
            cod_persona_padre,
            cod_tipo_relacion,
            descripcion,
        ]);

        res.status(201).json({ mensaje: 'Estructura Familiar creada exitosamente' });
    } catch (error) {
        console.error('Error al crear la estructura familiar:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};



export const actualizarEstructuraFamiliar = async (req, res) => {
    const { Cod_genealogia } = req.params;

    const {
        cod_persona_estudiante,
        cod_persona_padre,
        cod_tipo_relacion,
        descripcion,
    } = req.body;

    try {
        // Verificar si el tipo de relación es "Padre" o "Madre"
        if (cod_tipo_relacion === 'Padre' || cod_tipo_relacion === 'Madre') {
            // Validar si ya existe ese tipo de relación para el estudiante, excluyendo el registro actual
            const [resultado] = await pool.query(
                'SELECT * FROM tbl_estructura_familiar WHERE cod_persona_estudiante = ? AND cod_tipo_relacion = ? AND Cod_genealogia != ?',
                [cod_persona_estudiante, cod_tipo_relacion, Cod_genealogia]
            );

            if (resultado.length > 0) {
                return res.status(400).json({
                    mensaje: `El estudiante ya tiene registrado un ${cod_tipo_relacion}.`,
                });
            }
        }

        // Proceder con la actualización
        await pool.query('CALL P_Put_EstructuraFamiliar(?, ?, ?, ?, ?)', [
            Cod_genealogia,
            cod_persona_estudiante,
            cod_persona_padre,
            cod_tipo_relacion,
            descripcion,
        ]);

        res.status(200).json({ mensaje: 'Estructura Familiar actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};





// Controlador para eliminar 
export const eliminarEstructuraFamiliar = async (req, res) => {
    const { Cod_genealogia } = req.params;

    try {
        // Llamar al procedimiento almacenado para eliminar 
        const [rows] = await pool.query("CALL P_Delete_EstructuraFamiliar(?)", [Cod_genealogia]);

        
        if (rows.affectedRows > 0) {
            return res.status(200).json({ message: 'Estructura Familiar eliminada correctamente.' });
        } else {
            return res.status(404).json({ message: 'No se encontró el Estructura Familiar especificada.' });
        }
    } catch (error) {
        console.error('Error al eliminar Estructura Familiar:', error);
        return res.status(500).json({ message: 'Ocurrió un error al intentar eliminar Estructura Familiar.', error });
    }
};
