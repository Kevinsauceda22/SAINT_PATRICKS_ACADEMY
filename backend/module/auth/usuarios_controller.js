import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import conectarDB from '../../config/db.js';
import Generar_Id from '../../helpers/generar_Id.js';
import enviarCorreoVerificacion  from '../../helpers/emailHelper.js';
const pool = await conectarDB();
//importar el envio de correo



//este es el controlador de usuarios para creacion de usuarios al crear un usuario se crea una persona y un usuario
export const crearUsuario = async (req, res) => {
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
        Tipo,
        Nombre_departamento,
        Nombre_municipio,
        Valor,  
        tipo_contacto_nombre, 
        tipo_genero,
        nombre_usuario,
        correo_usuario,
        contraseña_usuario,
        descripcion_rol,  
    } = req.body;

    const connection = await pool.getConnection();

    try {
        // Validaciones
        if (!/^\d{13}$/.test(dni_persona)) {
            return res.status(400).json({ mensaje: 'El DNI debe tener exactamente 13 dígitos.' });
        }
        const primerCuatroDNI = parseInt(dni_persona.substring(0, 4));
        if (primerCuatroDNI < 101 || primerCuatroDNI > 909) {
            return res.status(400).json({ mensaje: 'Ingrese un DNI válido. Los primeros cuatro dígitos deben estar entre 0101 y 0909.' });
        }
        const añoNacimientoDNI = dni_persona.substring(4, 8);
        const añoNacimiento = parseInt(añoNacimientoDNI);
        if (añoNacimiento < 1920 || añoNacimiento > 2020) {
            return res.status(400).json({ mensaje: 'Ingrese un DNI válido. El año debe estar entre 1920 y 2020.' });
        }
        const nombreLength = Nombre.length;
        if (nombreLength < 3 || nombreLength > 40) {
            return res.status(400).json({ mensaje: 'El nombre debe tener entre 3 y 40 caracteres.' });
        }

        // Verificar si el DNI, correo o nombre ya existen
        const [existingUser] = await connection.query(
            'SELECT * FROM tbl_personas INNER JOIN tbl_usuarios ON tbl_personas.cod_persona = tbl_usuarios.cod_persona WHERE tbl_personas.dni_persona = ? OR tbl_usuarios.correo_usuario = ? OR tbl_usuarios.nombre_usuario = ?',
            [dni_persona, correo_usuario, nombre_usuario]
        );

        if (existingUser.length > 0) {
            if (existingUser.some(user => user.correo_usuario === correo_usuario)) {
                return res.status(400).json({ mensaje: 'El correo ya está en uso' });
            }
            return res.status(400).json({ mensaje: 'El DNI o nombre de usuario ya existen en el sistema' });
        }

        // Crear el nuevo tipo de persona si no existe
        const [tipoPersonaResult] = await connection.query(
            'INSERT INTO tbl_tipo_persona (Tipo) VALUES (?) ON DUPLICATE KEY UPDATE Cod_tipo_persona=LAST_INSERT_ID(Cod_tipo_persona)',
            [Tipo]
        );
        const cod_tipo_persona = tipoPersonaResult.insertId || tipoPersonaResult[0].Cod_tipo_persona;

        // Crear el nuevo género si no existe
        const [generoResult] = await connection.query(
            'INSERT INTO tbl_genero_persona (Tipo_genero) VALUES (?) ON DUPLICATE KEY UPDATE Cod_genero=LAST_INSERT_ID(Cod_genero)',
            [tipo_genero]
        );
        const cod_genero = generoResult.insertId || generoResult[0].Cod_genero;

        // Crear el nuevo departamento si no existe
        const [departamentoResult] = await connection.query(
            'INSERT INTO tbl_departamento (Nombre_departamento, Nombre_municipio) VALUES (?, ?) ON DUPLICATE KEY UPDATE Cod_departamento=LAST_INSERT_ID(Cod_departamento)',
            [Nombre_departamento, Nombre_municipio]
        );
        const cod_departamento = departamentoResult.insertId || departamentoResult[0].Cod_departamento;

        // Crear la nueva persona
        await connection.query(
            "CALL crearPersona(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
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

        // Obtener el cod_persona usando LAST_INSERT_ID()
        const [[result]] = await connection.query('SELECT LAST_INSERT_ID() AS cod_persona');
        const cod_persona = result.cod_persona;

        if (!cod_persona) {
            return res.status(500).json({ mensaje: 'Error al recuperar el ID de la persona recién creada' });
        }

        // Crear el nuevo tipo de contacto si no existe
        const [tipoContactoResult] = await connection.query(
            'INSERT INTO tbl_tipo_contacto (tipo_contacto) VALUES (?) ON DUPLICATE KEY UPDATE Cod_tipo_contacto=LAST_INSERT_ID(Cod_tipo_contacto)',
            [tipo_contacto_nombre]
        );
        const cod_tipo_contacto = tipoContactoResult.insertId || tipoContactoResult[0].Cod_tipo_contacto;

        // Llamar al procedimiento almacenado para agregar el contacto
        await connection.query(
            'CALL agregarContacto(?, ?, ?)', 
            [cod_persona, Valor, cod_tipo_contacto]
        );

        // Obtener o crear el rol en tbl_roles
        const [rolResult] = await connection.query(
            'INSERT INTO tbl_roles (Descripcion) VALUES (?) ON DUPLICATE KEY UPDATE Cod_rol=LAST_INSERT_ID(Cod_rol)',
            [descripcion_rol]  
        );
        const cod_rol = rolResult.insertId || rolResult[0].Cod_rol;

        // Definir el estado del usuario
        const cod_estado_usuario = 1;

        // Generar token
        const token_usuario = Generar_Id();

        // Hashear la contraseña antes de insertarla
        const saltRounds = 10; 
        const hashedPassword = await bcrypt.hash(contraseña_usuario, saltRounds);
        
        // Insertar el usuario en tbl_usuarios
        const [nuevoUsuarioResult] = await connection.query(
            'CALL crearUsuario(?, ?, ?, ?, ?, ?, ?, ?)', 
            [nombre_usuario, correo_usuario, hashedPassword, cod_estado_usuario, token_usuario, cod_persona, cod_rol, new Date()]  
        );

        // Obtener el cod_usuario usando LAST_INSERT_ID()
        const [[nuevoUsuario]] = await connection.query('SELECT LAST_INSERT_ID() AS cod_usuario');
        const cod_usuario = nuevoUsuario.cod_usuario;

        // Insertar la contraseña hasheada en el historial de contraseñas
        await connection.query(
            'INSERT INTO tbl_hist_contraseña (Cod_usuario, Contraseña, Fecha_creacion) VALUES (?, ?, ?)', 
            [cod_usuario, hashedPassword, new Date()] 
        );

        // Generar el token JWT para el usuario
        const token = jwt.sign({ cod_persona }, 'secreto', { expiresIn: '1h' });

        // Respuesta exitosa con el token y redirección
        res.status(201).json({ 
            mensaje: 'Usuario registrado correctamente', 
            usuario: nuevoUsuario, 
            token // Incluye el token en la respuesta
        });
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        res.status(500).json({ mensaje: 'Error al crear el usuario' });
    } finally {
        connection.release();
    }
};

export const preRegistroUsuario = async (req, res) => {
    const { 
        primer_nombre, 
        primer_apellido, 
        correo_usuario, 
        contraseña_usuario, 
        confirmar_contraseña 
    } = req.body;

    const connection = await pool.getConnection();

    try {
        // Validar que la contraseña y la confirmación sean iguales
        if (contraseña_usuario !== confirmar_contraseña) {
            return res.status(400).json({ mensaje: 'Las contraseñas no coinciden' });
        }

        // Verificar si el correo ya existe
        const [existingUser] = await connection.query(
            'SELECT * FROM tbl_usuarios WHERE correo_usuario = ?', 
            [correo_usuario]
        );
        if (existingUser.length > 0) {
            return res.status(400).json({ mensaje: 'El correo ya está en uso' });
        }

        // Insertar en tbl_personas con Cod_tipo_persona = 1 (Padre)
        const [resultPersona] = await connection.query(
            'INSERT INTO tbl_personas (Nombre, Primer_apellido, dni_persona, Estado_Persona, Cod_tipo_persona) VALUES (?, ?, ?, ?, ?)',
            [primer_nombre, primer_apellido, null, 'A', 1] // 'A' = Activo, Cod_tipo_persona = 1 (Padre)
        );

        const cod_persona = resultPersona.insertId; // Obtener el id de la persona insertada

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(contraseña_usuario, 10);

        // Generar token para el usuario
        const token_usuario = Generar_Id(); // Generar el token de usuario

        // Insertar en tbl_usuarios con el token generado
        await connection.query(
            'INSERT INTO tbl_usuarios (correo_usuario, contraseña_usuario, cod_persona, Cod_rol, Cod_estado_usuario, token_usuario) VALUES (?, ?, ?, ?, ?, ?)',
            [correo_usuario, hashedPassword, cod_persona, 1, 1, token_usuario] // Cod_rol = 1 (Padre), Cod_estado_usuario = 1 (Activo)
        );

        // Enviar el correo de verificación
        await enviarCorreoVerificacion(correo_usuario, primer_nombre, token_usuario);

        // Respuesta exitosa
        res.status(201).json({ 
            mensaje: 'Pre-registro exitoso, ahora verificaremos tu correo electrónico.',
            token_usuario // Puedes devolver el token si es necesario
        });
    } catch (error) {
        console.error('Error en el pre-registro:', error);
        res.status(500).json({ mensaje: 'Error al realizar el pre-registro' });
    } finally {
        connection.release();
    }
};

export const agregarEstudiante = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        // Obtener el token del encabezado
        const { authorization } = req.headers;
        const tokens = authorization.split(" ");

        if (tokens.length !== 2 || tokens[0] !== "Bearer") {
            return res.status(401).json({ mensaje: "Tokens inválidos" });
        }

        const tokenPadre = tokens[1]; // Token del padre

        // Verificar el token del padre
        const decodedPadre = jwt.verify(tokenPadre, process.env.JWT_SECRET);

        // Extraer los datos del cuerpo de la solicitud
        const { 
            dni_hijo, 
            nombre_hijo, 
            primer_apellido, 
            segundo_apellido, 
            nacionalidad, 
            direccion, 
            fecha_nacimiento, 
            tipo_relacion, 
            segundo_nombre,
            descripcion,
            nombre_departamento, // Nombre del departamento
            nombre_municipio, // Nombre del municipio
            genero, // Género del estudiante
        } = req.body;

        // Obtener Cod_tipo_persona para estudiante
        const [tipoPersona] = await connection.query('SELECT Cod_tipo_persona FROM tbl_tipo_persona WHERE Tipo = ?', ['E']); // 'E' para estudiante
        const codTipoPersona = tipoPersona.length > 0 ? tipoPersona[0].Cod_tipo_persona : null;

        if (!codTipoPersona) {
            return res.status(400).json({ mensaje: "Tipo de persona no encontrado" });
        }

        // Obtener Cod_tipo_relacion correspondiente al tipo_relacion
        const [tipoRelacion] = await connection.query('SELECT Cod_tipo_relacion FROM tbl_tipo_relacion WHERE Tipo_relacion = ?', [tipo_relacion]);
        const codTipoRelacion = tipoRelacion.length > 0 ? tipoRelacion[0].Cod_tipo_relacion : null;

        if (!codTipoRelacion) {
            return res.status(400).json({ mensaje: "Tipo de relación no encontrado" });
        }

        // Obtener Cod_genero correspondiente al género
        const [generoQuery] = await connection.query('SELECT Cod_genero FROM tbl_genero_persona WHERE Tipo_genero = ?', [genero]);
        const codGenero = generoQuery.length > 0 ? generoQuery[0].Cod_genero : null;

        if (!codGenero) {
            return res.status(400).json({ mensaje: "Género no encontrado" });
        }

        // Crear el nuevo departamento si no existe
        const [departamentoResult] = await connection.query(
            'INSERT INTO tbl_departamento (Nombre_departamento, Nombre_municipio) VALUES (?, ?) ON DUPLICATE KEY UPDATE Cod_departamento=LAST_INSERT_ID(Cod_departamento)',
            [nombre_departamento, nombre_municipio]
        );

        // Obtener el Cod_departamento del resultado
        const cod_departamento = departamentoResult.insertId || departamentoResult[0].Cod_departamento;

        // Insertar el estudiante en la base de datos
        const [result] = await connection.query(
            'INSERT INTO tbl_personas (dni_persona, Nombre, Segundo_nombre, Primer_apellido, Segundo_Apellido, Nacionalidad, direccion_persona, fecha_nacimiento, Cod_tipo_persona, Cod_departamento, Cod_genero) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [dni_hijo, nombre_hijo, segundo_nombre, primer_apellido, segundo_apellido, nacionalidad, direccion, fecha_nacimiento, codTipoPersona, cod_departamento, codGenero]
        );

        const codPersonaHijo = result.insertId; // Obtener el ID del estudiante insertado

        // Relacionar el estudiante con el padre en tbl_estructura_familiar
        await connection.query(
            'INSERT INTO tbl_estructura_familiar (Cod_persona_padre, Cod_persona_estudiante, dni_hijo, Cod_tipo_relacion, Descripcion) VALUES (?, ?, ?, ?, ?)',
            [decodedPadre.cod_persona, codPersonaHijo, dni_hijo, codTipoRelacion, descripcion]
        );

        return res.status(201).json({ mensaje: "Estudiante registrado exitosamente." });

    } catch (error) {
        console.error("Error en agregarEstudiante:", error);
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ mensaje: "Token ha expirado" });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ mensaje: "Token inválido" });
        }
        return res.status(500).json({ mensaje: "Error al registrar al estudiante." });
    } finally {
        connection.release();
    }
};

//con este controlador se obtienen todos los usuarios pero tiene una ruta protegida que requiere un token jwt
export const obtenerUsuarios = async (req, res) => {
    try {
        const [usuarios] = await pool.query('CALL ObtenerUsuarios()');

        if (!usuarios.length) {
            return res.status(404).json({ mensaje: 'No se encontraron usuarios' });
        }

        res.status(200).json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ mensaje: 'Error al obtener los usuarios' });
    }
};

// controllers/usuarioController.js
export const confirmarCuenta = async (req, res) => {
    const { token_usuario } = req.params; // Leer el token desde los parámetros de la URL

    try {
        const db = await conectarDB();

        // Consulta para verificar el token en la base de datos
        const [rows] = await db.query('SELECT * FROM tbl_usuarios WHERE token_usuario = ?', [token_usuario]);

        if (rows.length > 0) {
            // Si se encuentra el usuario, actualizar el estado de confirmación y eliminar el token
            await db.query(
                'UPDATE tbl_usuarios SET confirmacion_email = 1, token_usuario = NULL WHERE token_usuario = ?', 
                [token_usuario]
            );

            return res.status(200).json({ message: 'Cuenta confirmada exitosamente.' });
        } else {
            return res.status(400).json({ message: 'Token inválido o expirado.' });
        }
    } catch (err) {
        console.error('Error en la confirmación de cuenta:', err);
        return res.status(500).json({ message: 'Error en la confirmación de cuenta.' });
    }
};



//con este controlador se obtiene un usuario por su id y tiene una ruta protegida que requiere un token jwt
export const obtenerUsuarioPorId = async (req, res) => {
    try {
        const [usuario] = await pool.query('CALL ObtenerUsuarioPorID(?)', [req.params.cod_usuario]);

        // Verifica que el resultado tenga longitud y que contenga resultados
        if (!usuario || usuario.length === 0 || usuario[0].length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Devuelve el primer usuario encontrado
        res.status(200).json(usuario[0][0]); // Asegúrate de acceder al primer usuario
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener el usuario' });
    }
};

//con este controlador se actualiza un usuario por su id y tiene una ruta protegida que requiere un token jwt
export const actualizarUsuario = async (req, res) => {
    const { nombre_usuario, correo_usuario, contraseña_usuario, rol_usuario, confirmacion_email, token_usuario } = req.body;

    const connection = await pool.getConnection();
    try {
        let queryParams = [req.params.cod_usuario, nombre_usuario, correo_usuario, rol_usuario, confirmacion_email, token_usuario];
        if (contraseña_usuario) {
            const hashedPassword = await bcrypt.hash(contraseña_usuario, 10);
            queryParams.splice(2, 0, hashedPassword);
        }

        const [result] = await connection.query('CALL sp_actualizar_usuario(?, ?, ?, ?, ?, ?, ?)', queryParams);
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        res.status(200).json({ mensaje: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar el usuario' });
    } finally {
        connection.release();
    }
};

export const eliminarUsuarioCompleto = async (req, res) => {
    const { cod_usuario } = req.params; // Obtener el cod_usuario de los parámetros de la URL

    const connection = await pool.getConnection();

    try {
        // Iniciar una transacción
        await connection.beginTransaction();

        // Verificar si el usuario existe antes de intentar eliminarlo
        const [usuarioExistente] = await connection.query(
            'SELECT * FROM tbl_usuarios WHERE cod_usuario = ?',
            [cod_usuario]
        );

        if (usuarioExistente.length === 0) {
            return res.status(404).json({ mensaje: 'El usuario no existe.' });
        }

        // Obtener cod_persona del usuario que se va a eliminar
        const cod_persona = usuarioExistente[0].cod_persona;

        // Eliminar el historial de contraseñas
        await connection.query('DELETE FROM tbl_hist_contraseña WHERE Cod_usuario = ?', [cod_usuario]);

        // Eliminar los contactos asociados a la persona
        await connection.query('DELETE FROM tbl_contacto WHERE cod_persona = ?', [cod_persona]);

        // Eliminar los registros de usuario
        await connection.query('DELETE FROM tbl_usuarios WHERE cod_usuario = ?', [cod_usuario]);

        // Eliminar la persona asociada
        await connection.query('DELETE FROM tbl_personas WHERE cod_persona = ?', [cod_persona]);

        // Si todo fue exitoso, hacer commit de la transacción
        await connection.commit();

        // Responder con éxito
        res.status(200).json({ mensaje: 'Usuario y datos asociados eliminados correctamente.' });

    } catch (error) {
        // Si ocurre un error, revertir la transacción
        await connection.rollback();
        console.error('Error al eliminar el usuario y datos asociados:', error);
        res.status(500).json({ mensaje: 'Error al eliminar el usuario y los datos relacionados.' });
    } finally {
        connection.release();  // Liberar la conexión
    }
};

// Con este controlador se autentica un usuario y se genera un token jwt y que si la contraseña ingresada coincide con una contraseña antigua, devolver un error
export const autenticarUsuario = async (req, res) => {
    const { identificador, contraseña_usuario } = req.body;

    try {
        // Verificar si el usuario existe por nombre de usuario o correo
        const [user] = await pool.query(
            'SELECT * FROM tbl_usuarios WHERE nombre_usuario = ? OR correo_usuario = ?',
            [identificador, identificador]
        );

        if (user.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const usuario = user[0];

        // Verificar la contraseña actual primero
        const contraseñaValida = await bcrypt.compare(contraseña_usuario, usuario.contraseña_usuario);
        
        // Verificar si el usuario ha confirmado su cuenta
        if (usuario.confirmacion_email !== 1) {
            return res.status(403).json({ mensaje: 'Cuenta no confirmada. Por favor, verifica tu correo electrónico.' });
        }

        // Si la contraseña es válida, generar el token
        if (contraseñaValida) {
            const token = jwt.sign(
                { 
                    cod_usuario: usuario.cod_usuario, 
                    nombre_usuario: usuario.nombre_usuario, 
                    rol_usuario: usuario.rol_usuario, 
                    cod_persona: usuario.cod_persona 
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            return res.status(200).json({
                mensaje: 'Autenticación exitosa',
                token
            });
        }

        // Si la contraseña no es válida, verificar en el historial de contraseñas
        const [historial] = await pool.query('SELECT * FROM tbl_hist_contraseña WHERE Cod_usuario = ?', [usuario.cod_usuario]);

        // Verificar si la contraseña ingresada está en el historial
        for (const record of historial) {
            const contrasenaHistorial = record.Contraseña;

            if (await bcrypt.compare(contraseña_usuario, contrasenaHistorial)) {
                return res.status(400).json({ mensaje: 'Has ingresado una contraseña antigua' });
            }
        }

        // Si la contraseña no es válida ni está en el historial
        return res.status(401).json({ mensaje: 'Contraseña o nombre de usuario/correo incorrecto' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ mensaje: 'Error al autenticar usuario' });
    }
};
// PARA MOSTRAR EL PERFIL DE UN USUARIO
export const mostrarPerfil = async (req, res) => {
    const cod_usuario = req.params.cod_usuario; // Este es el ID que se pasa en la URL
    const usuarioAutenticado = req.usuario.cod_usuario; // ID del usuario autenticado desde el token

    // Verificar si cod_usuario es un número entero
    if (!Number.isInteger(Number(cod_usuario))) {
        return res.status(400).json({ mensaje: 'ID de usuario inválido' });
    }

    // Verificar que el usuario autenticado intenta acceder a su propio perfil
    if (Number(cod_usuario) !== Number(usuarioAutenticado)) {
        return res.status(403).json({ mensaje: 'Acceso denegado. No puedes ver el perfil de otro usuario' });
    }

    try {
        const [usuario] = await pool.query('CALL MostrarPerfil(?)', [cod_usuario]);

        // Verificar si el resultado es nulo o vacío
        if (!usuario || usuario.length === 0 || usuario[0].length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        res.status(200).json(usuario[0][0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener el perfil del usuario' });
    }
};

//con este controlador se recupera la contraseña del usuario y que si no esta confirmado el correo no se puede recuperar la contraseña
export const OlvidePasssword = async (req, res) => {
    const { correo_usuario } = req.body;

    try {
        const [usuario] = await pool.query('SELECT * FROM tbl_usuarios WHERE correo_usuario = ?', [correo_usuario]);

        if (usuario.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

       //si el usuario no ha confirmado su correo, no se puede recuperar la contraseña 
        if (usuario[0].confirmacion_email !== 1) { 
            return res.status(403).json({ mensaje: 'Cuenta no confirmada. Por favor, verifica tu correo electrónico.' });
        }

        const token = Generar_Id();

        await pool.query('UPDATE tbl_usuarios SET token_usuario = ? WHERE correo_usuario = ?', [token, correo_usuario]);

        res.status(200).json({ mensaje: 'Correo de recuperación de contraseña enviado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al recuperar la contraseña' });
    }
};

//con este controlador se comprueba el token de recuperar contraseña
export const comprobarToken = async (req, res) => {
    const { token } = req.params;

    try {
        const [usuario] = await pool.query('SELECT * FROM tbl_usuarios WHERE token_usuario = ?', [token]);

        if (usuario.length === 0) {
            return res.status(404).json({ mensaje: 'Token inválido o expirado' });
        }

        res.status(200).json({ mensaje: 'Token válido' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al comprobar el token' });
    }
};

// Controlador para cambiar la contraseña del usuario
export const cambiarContrasena = async (req, res) => {
    const { token } = req.params; // Obtener el token de la URL
    const { contraseña_usuario } = req.body; // Obtener la nueva contraseña del cuerpo de la solicitud

    try {
        // Verificar si el token es válido
        const [usuario] = await pool.query('SELECT * FROM tbl_usuarios WHERE token_usuario = ?', [token]);

        if (usuario.length === 0) {
            return res.status(404).json({ mensaje: 'Token inválido o expirado' });
        }

        // Hash de la nueva contraseña
        const hashedPassword = await bcrypt.hash(contraseña_usuario, 10);

        // Actualizar la contraseña del usuario en la base de datos
        await pool.query('UPDATE tbl_usuarios SET contraseña_usuario = ?, token_usuario = NULL WHERE cod_usuario = ?', [hashedPassword, usuario[0].cod_usuario]);

        // Opcional: Agregar la nueva contraseña al historial de contraseñas
        await pool.query('INSERT INTO tbl_hist_contraseña (Cod_usuario, Contraseña, Fecha_creacion) VALUES (?, ?, NOW())', [usuario[0].cod_usuario, hashedPassword]);

        res.status(200).json({ mensaje: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al cambiar la contraseña' });
    }
};

