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


export const obtenerFichaEstudiante = async (req, res) => {
    try {
        const { cod_persona } = req.params;

        if (!cod_persona) {
            return res.status(400).json({ Mensaje: 'Debe proporcionar un código de persona válido' });
        }

        const [rows] = await pool.query('CALL P_Get_FichaEstudiante(?)', [cod_persona]);

        console.log('Respuesta cruda desde la BD:', JSON.stringify(rows, null, 2)); // ✅ Depuración global

        if (!rows || rows.length === 0 || rows[0].length === 0) {
            return res.status(404).json({ Mensaje: 'No se encontró ficha de estudiante para el código proporcionado' });
        }

        // ✅ Estructurar correctamente los datos del estudiante
        const estudianteBase = {
            cod_persona: rows[0][0]?.cod_persona || null,
            Nombre_Completo: rows[0][0]?.Nombre_Completo || 'NO DISPONIBLE',
            DNI: rows[0][0]?.DNI || 'NO DISPONIBLE',
            Fecha_Nacimiento: rows[0][0]?.Fecha_Nacimiento 
                ? new Date(rows[0][0].Fecha_Nacimiento).toISOString().split('T')[0] 
                : 'NO DISPONIBLE',
            Genero: rows[0][0]?.Genero || 'NO DISPONIBLE',
            Nacionalidad: rows[0][0]?.Nacionalidad || 'NO DISPONIBLE',
            Direccion: rows[0][0]?.Direccion || 'NO DISPONIBLE',
            Departamento: rows[0][0]?.Departamento || 'NO DISPONIBLE',
            Municipio: rows[0][0]?.Municipio || 'NO DISPONIBLE',
            familiares: rows.length > 1 && rows[1].length > 0 ? rows[1].map(familiar => ({
                cod_familiar: familiar?.Cod_Familiar || null,
                nombre_familiar: familiar?.Nombre_Familiar || 'NO DISPONIBLE',
                tipo_relacion: familiar?.Tipo_Relacion || 'NO DISPONIBLE',
                dni_familiar: familiar?.DNI_Familiar || 'NO DISPONIBLE',
                telefonos_moviles: familiar?.Telefonos_Moviles_Familiar ? familiar.Telefonos_Moviles_Familiar.split(', ') : [],
                telefonos_fijos: familiar?.Telefonos_Fijos_Familiar ? familiar.Telefonos_Fijos_Familiar.split(', ') : [],
                correos: familiar?.Correos_Familiar ? familiar.Correos_Familiar.split(', ') : []
            })) : []
        };

        console.log('✅ Ficha del estudiante estructurada correctamente:', JSON.stringify(estudianteBase, null, 2));

        res.status(200).json(estudianteBase);
    } catch (error) {
        console.error('❌ Error al obtener ficha de estudiante:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};




export const obtenerFichaPadre = async (req, res) => {
    try {
        const { cod_persona } = req.params;

        if (!cod_persona) {
            return res.status(400).json({ Mensaje: 'Debe proporcionar un código de persona válido' });
        }

        const [results] = await pool.query('CALL P_Get_FichaPadre(?)', [cod_persona]);

        console.log('🔍 Respuesta cruda desde la BD:', JSON.stringify(results, null, 2)); // ✅ Depuración global

        if (!results || results.length === 0 || results[0].length === 0) {
            return res.status(404).json({ Mensaje: 'No se encontró ficha de padre para el código proporcionado' });
        }

        // ✅ Procesamos los datos del padre correctamente
        const fichaPadre = results[0][0];
        const hijos = results.length > 1 && results[1].length > 0 ? results[1] : []; // ✅ Segundo conjunto de datos son los hijos

        // ✅ Asegurar que los contactos siempre sean manejados correctamente
        fichaPadre.Telefonos_Moviles = fichaPadre.Telefonos_Moviles ? fichaPadre.Telefonos_Moviles.split(', ') : [];
        fichaPadre.Telefonos_Fijos = fichaPadre.Telefonos_Fijos ? fichaPadre.Telefonos_Fijos.split(', ') : [];
        fichaPadre.Correos = fichaPadre.Correos ? fichaPadre.Correos.split(', ') : [];

        // ✅ Agregar la lista de hijos al objeto del padre
        fichaPadre.hijos = hijos;

        console.log(' Ficha del padre estructurada correctamente:', JSON.stringify(fichaPadre, null, 2));

        res.status(200).json(fichaPadre);
    } catch (error) {
        console.error('❌ Error al obtener ficha del padre:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};


    


//CONTROLADOR PARA OBTENER DEPARTAMENTOS
export const obtenerDepartamentos = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL P_Get_Departamentos()');

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
        const [rows] = await pool.query('CALL P_Get_TipoPersona()');

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
        const [rows] = await pool.query('CALL P_Get_GeneroPersona()');

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
        tipo_documento,
        dni_persona,
        Nombre,
        Segundo_nombre,
        Primer_apellido,
        Segundo_apellido,
        fecha_nacimiento,
        direccion_persona,
        cod_nacionalidad,
        cod_departamento,
        cod_municipio,
        cod_tipo_persona,
        cod_genero,
        principal
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

        // Llamar al procedimiento almacenado con el nuevo orden de parámetros
        await connection.query(
            "CALL P_Post_Personas(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
            [
                tipo_documento,
                dni_persona,
                Nombre,
                Segundo_nombre,
                Primer_apellido,
                Segundo_apellido,
                fecha_nacimiento,
                direccion_persona,
                cod_nacionalidad,
                cod_departamento,
                cod_municipio,
                cod_tipo_persona,
                cod_genero,
                principal
            ]
        );

        res.status(201).json({ mensaje: 'Persona creada exitosamente' });
    } catch (error) {
        console.error('Error al crear la persona:', error);
        if (!res.headersSent) {
            res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
        }
    } finally {
        if (connection) connection.release();
    }   
};



//CONTROLADOR PARA ACTUALIZAR UNA PERSONA
export const actualizarPersona = async (req, res) => {
    const { cod_persona } = req.params; // Código de persona desde la URL

    const {
        tipo_documento,
        dni_persona,
        Nombre,
        Segundo_nombre,
        Primer_apellido,
        Segundo_apellido,
        fecha_nacimiento,
        direccion_persona,
        cod_nacionalidad,
        cod_departamento,
        cod_municipio,
        cod_tipo_persona,
        cod_genero,
        principal
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
            tipo_documento,
            dni_persona,
            Nombre,
            Segundo_nombre,
            Primer_apellido,
            Segundo_apellido,
            fecha_nacimiento,
            direccion_persona,
            cod_nacionalidad,
            cod_departamento,
            cod_municipio,
            cod_tipo_persona,
            cod_genero,
            principal
        ]);

        res.status(200).json({ mensaje: 'Persona actualizada exitosamente' });

    } catch (error) {
        console.error('Error al actualizar la persona:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    } finally {
        connection.release();
    }
};

export const actualizarEstadoPersona = async (req, res) => {
    const { cod_persona, estado } = req.body;

    // Verifica lo que está llegando
    console.log('cod_persona recibido:', cod_persona);
    console.log('estado recibido:', estado);

    // Validar parámetros
    if (!cod_persona || estado === undefined) {
        return res.status(400).json({ mensaje: 'Faltan parámetros' });
    }

    // Asegurarnos de que cod_persona sea un número
    const codPersonaNumber = Number(cod_persona);
    console.log('cod_persona convertido a número:', codPersonaNumber);  // Debugging

    if (isNaN(codPersonaNumber)) {
        return res.status(400).json({ mensaje: 'El código de persona debe ser un número válido' });
    }

    try {
        // Llamar al procedimiento almacenado
        const [results] = await pool.query('CALL P_Put_EstadoPersona(?, ?)', [codPersonaNumber, estado]);

        // Obtener el mensaje devuelto por el procedimiento
        const mensaje = results[0][0].mensaje;

        console.log(`Estado actualizado para persona ${codPersonaNumber}: ${estado}`); // Debug en consola
        res.json({ mensaje, cod_persona: codPersonaNumber, estado }); // Respuesta al frontend
    } catch (error) {
        console.error('Error al ejecutar el procedimiento almacenado:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
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

