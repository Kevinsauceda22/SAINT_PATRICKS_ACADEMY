import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


//CONTROLADOR PARA OBTENER LAS PERSONAS
export const obtenerPersonas = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL P_Get_Personas()');

        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'No se encontraron personas' });
        }
    } catch (error) {
        console.error('Error al obtener las personas:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

//CONTROLADOR PARA OBTENER DETALLE PERSONA
export const obtenerDetallePersona = async (req, res) => {
    const { cod_persona } = req.params; // Obtiene el código de la persona desde la URL

    try {
        const [rows] = await pool.query('CALL P_Get_Persona_Detalle(?)', [cod_persona]);

        if (rows[0].length > 0) {
            res.status(200).json(rows[0][0]); // Retorna el primer resultado como un objeto
        } else {
            res.status(404).json({ message: 'No se encontró la persona' });
        }
    } catch (error) {
        console.error('Error al obtener el detalle de la persona:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

//CONTROLADOR PARA OBTENER DEPARTAMENTOS
export const obtenerDepartamentos = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL P_Get_Departamento()');

        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'No se encontraron departamentos' });
        }
    } catch (error) {
        console.error('Error al obtener las departamentos:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

//CONTROLADOR PARA OBTENER TIPO DE PERSONA
export const obtenerTipoPersona = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL P_Get_Tipo_Persona()');

        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'No se encontraron departamentos' });
        }
    } catch (error) {
        console.error('Error al obtener las departamentos:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

//CONTROLADOR PARA OBTENER GENEROS
export const obtenerGeneros= async (req, res) => {
    try {
        const [rows] = await pool.query('CALL P_Get_Genero_Persona()');

        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'No se encontraron generos' });
        }
    } catch (error) {
        console.error('Error al obtener las generos:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

//CONTROLADOR PARA CREAR UNA PERSONA
export const crearPersona = async (req, res) => {
    const { 
        dni_persona,
        Nombre,
        Segundo_nombre,
        Primer_apellido,
        Segundo_apellido,
        direccion_persona,
        fecha_nacimiento,
        Estado_Persona,
        principal,
        cod_tipo_persona,
        cod_nacionalidad,
        cod_departamento,
        cod_municipio,
        cod_genero,
    } = req.body;

    const connection = await pool.getConnection();

    try {
        // Crear la nueva persona con el procedimiento almacenado
        await connection.query(
            "CALL P_Post_Personas(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
            [
                dni_persona,
                Nombre,
                Segundo_nombre,
                Primer_apellido,
                Segundo_apellido,
                direccion_persona,
                fecha_nacimiento,
                Estado_Persona,
                principal,
                cod_tipo_persona,
                cod_genero,
                cod_nacionalidad,
                cod_departamento,
                cod_municipio
            ]
        );

        res.status(201).json({ mensaje: 'Persona creada exitosamente' });
    } catch (error) {
        console.error('Error al crear la persona:', error);
        if (!res.headersSent) { // Verifica si los encabezados ya han sido enviados
            res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
        }
    } finally {
        connection.release();
    }
};

//CONTROLADOR PARA ACTUALIZAR UNA PERSONA
export const actualizarPersona = async (req, res) => {
    const { cod_persona } = req.params; // Código de persona desde la URL

    const {
        dni_persona,
        Nombre,
        Segundo_nombre,
        Primer_apellido,
        Segundo_apellido,
        direccion_persona,
        fecha_nacimiento,
        Estado_Persona,
        principal,
        cod_tipo_persona,
        cod_genero,
        cod_nacionalidad,
        cod_departamento,
        cod_municipio
    } = req.body;

    try {
        // Llamada al procedimiento almacenado para actualizar
        await pool.query('CALL P_Put_Personas(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            cod_persona,
            dni_persona,
            Nombre,
            Segundo_nombre,
            Primer_apellido,
            Segundo_apellido,
            direccion_persona,
            fecha_nacimiento,
            Estado_Persona,
            principal,
            cod_tipo_persona,
            cod_genero,
            cod_nacionalidad,
            cod_departamento,
            cod_municipio
        ]);

        res.status(200).json({ mensaje: 'Persona actualizada exitosamente' });

    } catch (error) {
        console.error('Error al actualizar la persona:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};




export const eliminarPersona = async (req, res) => {
    const { cod_persona } = req.params;

    const connection = await pool.getConnection();

    try {
        // Llamar al procedimiento almacenado para borrar la persona
        await connection.query('CALL P_Delete_Personas(?)', [cod_persona]);

        res.status(200).json({ mensaje: 'Persona eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar la persona:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    } finally {
        connection.release();
    }
};

