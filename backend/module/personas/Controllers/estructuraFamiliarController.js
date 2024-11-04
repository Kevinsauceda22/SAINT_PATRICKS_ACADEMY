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

// Controlador para obtener las personas
export const obtenerPersonas = async (req, res) => {
    const { rol } = req.query; // Obtenemos el rol de los parámetros de consulta (opcional)

    try {
        let query = 'CALL P_Get_Personas()';
        
        if (rol) {
            query += ` WHERE Cod_tipo_persona = ?`; // Filtrar por rol si se proporciona
        }
        
        const [rows] = rol 
            ? await pool.query(query, [rol]) 
            : await pool.query(query);

        if (rows[0].length > 0) {
            const personas = rows[0].map(persona => ({
                cod_persona: persona.cod_persona,
                fullName: `${persona.Nombre} ${persona.Segundo_nombre} ${persona.Primer_apellido} ${persona.Segundo_Apellido}`,
                dni: persona.dni_persona,
                rol: persona.Cod_tipo_persona
            }));
            res.status(200).json(personas);
        } else {
            res.status(404).json({ message: 'No se encontraron personas' });
        }
    } catch (error) {
        console.error('Error al obtener las personas:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

//Controlador para crear 
export const crearEstructuraFamiliar = async (req, res) => {
    const {
        descripcion,
        cod_persona_padre,
        cod_persona_estudiante,
        cod_tipo_relacion
    } = req.body;

    // Validar que el padre/tutor y el estudiante no sean la misma persona
    if (cod_persona_padre === cod_persona_estudiante) {
        return res.status(400).json({
            mensaje: 'No se puede seleccionar la misma persona como Padre/Tutor y Estudiante.'
        });
    }

    try {
        await pool.query('CALL P_Post_EstructuraFamiliar(?, ?, ?, ?)', [
            descripcion,
            cod_persona_padre,
            cod_persona_estudiante,
            cod_tipo_relacion
        ]);

        res.status(201).json({ mensaje: 'Estructura Familiar creada exitosamente' });
    } catch (error) {
        console.error('Error al crear la estructura familiar:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};


export const actualizarEstructuraFamiliar = async (req, res) => {
    const { Cod_genealogia } = req.params; // Obtiene el código del aula desde la URL

    const {
        descripcion,
        cod_persona_padre,
        cod_persona_estudiante,
        cod_tipo_relacion
    } = req.body;

    try {
        await pool.query('CALL P_Put_EstructuraFamiliar(?, ?, ?, ?, ?)', [
            Cod_genealogia,
            descripcion,
            cod_persona_padre,
            cod_persona_estudiante,
            cod_tipo_relacion
        ]);

        res.status(200).json({ mensaje: ' actualizada exitosamente' });
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
