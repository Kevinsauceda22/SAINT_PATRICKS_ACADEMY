import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


//Mostrar Personas
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

// Mostrar detalle de una persona
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

//API para crear persona
export const crearPersona = async (req, res) => {
    const { 
        dni_persona,
        Nombre,
        Segundo_nombre,
        Primer_apellido,
        Segundo_apellido,
        Nacionalidad,
        direccion_persona,
        fecha_nacimiento,
        Estado_Persona,
        cod_tipo_persona,
        cod_departamento,
        cod_genero 
    } = req.body;

    const connection = await pool.getConnection();
    const soloLetrasRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/; // Solo letras, acentos y espacios

    try {
        // Validación de DNI (13 dígitos exactos)
        if (!/^\d{13}$/.test(dni_persona)) {
            return res.status(400).json({ mensaje: 'El DNI debe tener exactamente 13 dígitos.' });
        }

        // Validación de los primeros cuatro dígitos del DNI (rango 0101 a 0909)
        const primerCuatroDNI = parseInt(dni_persona.substring(0, 4));
        if (primerCuatroDNI < 101 || primerCuatroDNI > 909) {
            return res.status(400).json({ mensaje: 'Ingrese un DNI válido. Los primeros cuatro dígitos deben estar entre 0101 y 0909.' });
        }

        // Validación del año de nacimiento en el DNI (1920 a 2020)
        const añoNacimientoDNI = parseInt(dni_persona.substring(4, 8));
        if (añoNacimientoDNI < 1920 || añoNacimientoDNI > 2020) {
            return res.status(400).json({ mensaje: 'Ingrese un DNI válido. El año debe estar entre 1920 y 2020.' });
        }

        // Validación del campo "Nombre"
        if (Nombre.length < 2 || Nombre.length > 50) {
            return res.status(400).json({ mensaje: 'El nombre debe tener entre 2 y 50 caracteres.' });
        }
        if (!soloLetrasRegex.test(Nombre)) {
            return res.status(400).json({ mensaje: 'Nombre no válido. El nombre solo puede contener letras y acentos.' });
        }

        // Validación del campo "Segundo_nombre" (si está presente)
        if (Segundo_nombre && Segundo_nombre.length > 0) {
            if (Segundo_nombre.length < 2 || Segundo_nombre.length > 50) {
                return res.status(400).json({ mensaje: 'Segundo nombre debe tener entre 2 y 50 caracteres.' });
            }
            if (!soloLetrasRegex.test(Segundo_nombre)) {
                return res.status(400).json({ mensaje: 'Segundo nombre no válido. El segundo nombre solo puede contener letras y acentos.' });
            }
        }

        // Validación del campo "Primer_apellido"
        if (Primer_apellido.length < 2 || Primer_apellido.length > 50) {
            return res.status(400).json({ mensaje: 'Primer apellido debe tener entre 2 y 50 caracteres.' });
        }
        if (!soloLetrasRegex.test(Primer_apellido)) {
            return res.status(400).json({ mensaje: 'Primer apellido no válido. El primer apellido solo puede contener letras y acentos.' });
        }

        // Validación del campo "Segundo_apellido" (si está presente)
        if (Segundo_apellido && Segundo_apellido.length > 0) {
            if (Segundo_apellido.length < 2 || Segundo_apellido.length > 50) {
                return res.status(400).json({ mensaje: 'Segundo apellido debe tener entre 2 y 50 caracteres.' });
            }
            if (!soloLetrasRegex.test(Segundo_apellido)) {
                return res.status(400).json({ mensaje: 'Segundo apellido no válido. El segundo apellido solo puede contener letras y acentos.' });
            }
        }

        // Validación del campo "Nacionalidad" (si está presente)
        if (Nacionalidad && Nacionalidad.length > 0) {
            if (!soloLetrasRegex.test(Nacionalidad)) {
                return res.status(400).json({ mensaje: 'Nacionalidad no válida. La nacionalidad solo puede contener letras y acentos.' });
            }
        }

        // Validación de la fecha de nacimiento (entre 1920 y 2020)
        const fechaNacimiento = new Date(fecha_nacimiento);
        const añoNacimiento = fechaNacimiento.getFullYear();
        if (añoNacimiento < 1920 || añoNacimiento > 2020) {
            return res.status(400).json({ mensaje: 'La fecha de nacimiento debe estar entre 1920 y 2020.' });
        }

        // Verificación si el DNI ya existe
        const [existingPerson] = await connection.query(
            'SELECT * FROM tbl_personas WHERE dni_persona = ?',
            [dni_persona]
        );

        if (existingPerson.length > 0) {
            return res.status(400).json({ mensaje: 'El DNI ya existe en el sistema' });
        }

        // Crear la nueva persona con el procedimiento almacenado
        await connection.query(
            "CALL P_Post_Personas(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
            [
                dni_persona,
                Nombre,
                Segundo_nombre,
                Primer_apellido,
                Segundo_apellido,
                Nacionalidad,
                direccion_persona,
                fecha_nacimiento,
                Estado_Persona,
                cod_tipo_persona,
                cod_departamento,
                cod_genero 
            ]
        );

        res.status(201).json({ mensaje: 'Persona creada exitosamente' });
    } catch (error) {
        console.error('Error al crear la persona:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    } finally {
        connection.release();
    }
};



//API para actualizar personas 
export const actualizarPersona = async (req, res) => {
    const { cod_persona } = req.params; // Obtiene el código de la persona desde la URL

    const {
        dni_persona,
        Nombre,
        Segundo_nombre,
        Primer_apellido,
        Segundo_apellido,
        Nacionalidad,
        direccion_persona,
        fecha_nacimiento,
        Estado_Persona,
        cod_tipo_persona,
        cod_departamento,
        cod_genero 
    } = req.body;

    const soloLetrasRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/; // Solo letras, acentos y espacios

    try {
        // Validación de DNI (13 dígitos exactos)
        if (!/^\d{13}$/.test(dni_persona)) {
            return res.status(400).json({ mensaje: 'El DNI debe tener exactamente 13 dígitos.' });
        }

        // Validación de los primeros cuatro dígitos del DNI (rango 0101 a 0909)
        const primerCuatroDNI = parseInt(dni_persona.substring(0, 4));
        if (primerCuatroDNI < 101 || primerCuatroDNI > 909) {
            return res.status(400).json({ mensaje: 'Ingrese un DNI válido. Los primeros cuatro dígitos deben estar entre 0101 y 0909.' });
        }

        // Validación del año de nacimiento en el DNI (1920 a 2020)
        const añoNacimientoDNI = parseInt(dni_persona.substring(4, 8));
        if (añoNacimientoDNI < 1920 || añoNacimientoDNI > 2020) {
            return res.status(400).json({ mensaje: 'Ingrese un DNI válido. El año debe estar entre 1920 y 2020.' });
        }

        // Validaciones de longitud y formato para los campos de texto
        if (Nombre.length < 2 || Nombre.length > 50 || !soloLetrasRegex.test(Nombre)) {
            return res.status(400).json({ mensaje: 'Nombre no válido. Debe tener entre 2 y 50 caracteres y solo puede contener letras y acentos.' });
        }
        if (Segundo_nombre && (Segundo_nombre.length < 2 || Segundo_nombre.length > 50 || !soloLetrasRegex.test(Segundo_nombre))) {
            return res.status(400).json({ mensaje: 'Segundo nombre no válido. Debe tener entre 2 y 50 caracteres y solo puede contener letras y acentos.' });
        }
        if (Primer_apellido.length < 2 || Primer_apellido.length > 50 || !soloLetrasRegex.test(Primer_apellido)) {
            return res.status(400).json({ mensaje: 'Primer apellido no válido. Debe tener entre 2 y 50 caracteres y solo puede contener letras y acentos.' });
        }
        if (Segundo_apellido && (Segundo_apellido.length < 2 || Segundo_apellido.length > 50 || !soloLetrasRegex.test(Segundo_apellido))) {
            return res.status(400).json({ mensaje: 'Segundo apellido no válido. Debe tener entre 2 y 50 caracteres y solo puede contener letras y acentos.' });
        }
        if (Nacionalidad && !soloLetrasRegex.test(Nacionalidad)) {
            return res.status(400).json({ mensaje: 'Nacionalidad no válida. Solo puede contener letras y acentos.' });
        }

        // Validación de la fecha de nacimiento
        const fechaNacimiento = new Date(fecha_nacimiento);
        const añoNacimiento = fechaNacimiento.getFullYear();
        if (añoNacimiento < 1920 || añoNacimiento > 2020) {
            return res.status(400).json({ mensaje: 'La fecha de nacimiento debe estar entre 1920 y 2020.' });
        }

        // Llamada al procedimiento almacenado para actualizar la persona
        await pool.query('CALL P_Put_Personas(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            cod_persona,
            dni_persona,
            Nombre,
            Segundo_nombre,
            Primer_apellido,
            Segundo_apellido,
            Nacionalidad,
            direccion_persona,
            fecha_nacimiento,
            Estado_Persona,
            cod_tipo_persona,
            cod_departamento,
            cod_genero
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
