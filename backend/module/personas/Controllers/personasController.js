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

export const obtenerDepartamentos = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL Seleccionar_Departamento()');

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

export const obtenerTipoPersona = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL 	Seleccionar_Tipo_Persona()');

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

export const obtenerGeneros= async (req, res) => {
    try {
        const [rows] = await pool.query('CALL Seleccionar_Generos()');

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
    const soloLetrasRegex = /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/;

    const tieneLetrasRepetidas = (texto) => {
        const regex = /(.)\1{3,}/; 
        return regex.test(texto.replace(/\s/g, '')); 
    };

    const tieneEspaciosMultiples = (texto) => {
        return /\s{2,}/.test(texto); 
    };

    try {
        // Validación de DNI
        if (!/^\d{13}$/.test(dni_persona)) {
            return res.status(400).json({ mensaje: 'El DNI debe tener exactamente 13 dígitos.' });
        }

        // Validación de los primeros cuatro dígitos del DNI
        const primerCuatroDNI = parseInt(dni_persona.substring(0, 4));
        if (primerCuatroDNI < 101 || primerCuatroDNI > 909) {
            return res.status(400).json({ mensaje: 'Ingrese un DNI válido. Los primeros cuatro dígitos deben estar entre 0101 y 0909.' });
        }

        // Validación del año de nacimiento en el DNI
        const añoNacimientoDNI = parseInt(dni_persona.substring(4, 8));
        if (añoNacimientoDNI < 1920 || añoNacimientoDNI > 2020) {
            return res.status(400).json({ mensaje: 'Ingrese un DNI válido. El año debe estar entre 1920 y 2020.' });
        }

        // Función para validar un campo de texto
        const validarCampo = (campo, nombreCampo) => {
            if (tieneLetrasRepetidas(campo)) {
                return res.status(400).json({ mensaje: `${nombreCampo} no puede contener la misma letra más de 3 veces consecutivas.` });
            }
            if (tieneEspaciosMultiples(campo)) {
                return res.status(400).json({ mensaje: `${nombreCampo} no puede tener más de un espacio consecutivo.` });
            }
        };

        // Validación de la fecha de nacimiento
        const fechaNacimiento = new Date(fecha_nacimiento);
        const añoNacimiento = fechaNacimiento.getFullYear();
        if (añoNacimiento < 1920 || añoNacimiento > 2020) {
            return res.status(400).json({ mensaje: 'La fecha de nacimiento debe estar entre 1920 y 2020.' });
        }

        // Validaciones
        const validaciones = [
            { campo: Nombre, nombreCampo: 'El nombre' },
            { campo: Segundo_nombre, nombreCampo: 'El segundo nombre', optional: true },
            { campo: Primer_apellido, nombreCampo: 'El primer apellido' },
            { campo: Segundo_apellido, nombreCampo: 'El segundo apellido', optional: true },
            { campo: Nacionalidad, nombreCampo: 'La nacionalidad' },
            { campo: direccion_persona, nombreCampo: 'La dirección' } // Validación para dirección
        ];

        for (const { campo, nombreCampo, optional } of validaciones) {
            if (campo || optional) { // Solo validar si el campo es obligatorio o está presente
                const error = validarCampo(campo, nombreCampo);
                if (error) return error; // Si hay un error, retorna la respuesta y evita continuar
            }
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
        if (!res.headersSent) { // Verifica si los encabezados ya han sido enviados
            res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
        }
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

    // Función para validar letras repetidas
    const tieneLetrasRepetidas = (texto) => {
        const regex = /(.)\1{3,}/; 
        return regex.test(texto.replace(/\s/g, '')); // Elimina espacios para la validación
    };

    // Función para validar espacios múltiples
    const tieneEspaciosMultiples = (texto) => {
        return /\s{2,}/.test(texto); 
    };

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
        const validaciones = [
            { campo: Nombre, nombreCampo: 'El nombre' },
            { campo: Segundo_nombre, nombreCampo: 'El segundo nombre', optional: true },
            { campo: Primer_apellido, nombreCampo: 'El primer apellido' },
            { campo: Segundo_apellido, nombreCampo: 'El segundo apellido', optional: true },
            { campo: Nacionalidad, nombreCampo: 'La nacionalidad', optional: true },
            { campo: direccion_persona, nombreCampo: 'La dirección' } // Validación para dirección
        ];

        for (const { campo, nombreCampo, optional } of validaciones) {
            if (campo || optional) { // Solo validar si el campo es obligatorio o está presente
                if (tieneLetrasRepetidas(campo)) {
                    return res.status(400).json({ mensaje: `${nombreCampo} no puede contener la misma letra más de 3 veces consecutivas.` });
                }
                if (tieneEspaciosMultiples(campo)) {
                    return res.status(400).json({ mensaje: `${nombreCampo} no puede tener más de un espacio consecutivo.` });
                }
                if (campo.length < 2 || campo.length > 50 || !soloLetrasRegex.test(campo)) {
                    return res.status(400).json({ mensaje: `${nombreCampo} no válido. Debe tener entre 2 y 50 caracteres y solo puede contener letras y acentos.` });
                }
            }
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

