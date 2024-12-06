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

//OBTENER MUNICIPIOS CON DEPARTAMENTO
export const obtenerMunicipiosConDepartamento = async (req, res) => {
    try {
      const pool = await conectarDB(); // Conectar a la base de datos
  
      // Ejecutar el procedimiento almacenado GetMunicipiosConDepartamento
      const [rows] = await pool.query('CALL P_Get_Municipios_Departamento()');
  
      // Verificar si se encontraron resultados
      if (rows.length > 0) {
        res.status(200).json(rows); // Devolvemos los resultados de la consulta
      } else {
        res.status(404).json({ message: 'No se encontraron municipios' });
      }
    } catch (error) {
      console.error('Error al obtener municipios con departamento:', error);
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
            res.status(404).json({ message: 'No se encontraron' });
        }
    } catch (error) {
        console.error('Error al obtener las :', error);
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
        // Verificar si el DNI ya existe en la base de datos
        const [result] = await connection.query(
            "SELECT COUNT(*) AS count FROM tbl_personas WHERE dni_persona = ?", 
            [dni_persona]
        );

        if (result[0].count > 0) {
            return res.status(400).json({
                mensaje: 'El DNI ingresado ya está registrado en el sistema.',
            });
        }

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

    const connection = await pool.getConnection();

    try {
        // Verificar si el DNI ya existe en la base de datos, excluyendo la persona actual
        const [result] = await connection.query(
            "SELECT COUNT(*) AS count FROM tbl_personas WHERE dni_persona = ? AND cod_persona != ?", 
            [dni_persona, cod_persona]
        );

        if (result[0].count > 0) {
            return res.status(400).json({
                mensaje: 'El DNI ingresado ya está registrado en el sistema para otra persona.',
            });
        }

        // Llamada al procedimiento almacenado para actualizar
        await connection.query('CALL P_Put_Personas(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
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
    } finally {
        connection.release();
    }
};





export const eliminarPersona = async (req, res) => {
    const { cod_persona } = req.params;

    const connection = await pool.getConnection();

    try {
        await connection.query('CALL P_Delete_Personas(?)', [cod_persona]);

        res.status(200).json({ mensaje: 'Persona eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar la persona:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    } finally {
        connection.release();
    }
};

