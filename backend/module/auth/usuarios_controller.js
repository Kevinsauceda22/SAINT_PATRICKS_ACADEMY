import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import conectarDB from '../../config/db.js';
import Generar_Id from '../../helpers/generar_Id.js';
const pool = await conectarDB();
const confirmacion_email ='0' ;
import db from '../../config/db.js';

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
        // Verificar si el DNI, correo o nombre ya existen
        const [existingUser] = await connection.query(
            'SELECT * FROM tbl_personas INNER JOIN tbl_usuarios ON tbl_personas.cod_persona = tbl_usuarios.cod_persona WHERE tbl_personas.dni_persona = ? OR tbl_usuarios.correo_usuario = ? OR tbl_usuarios.nombre_usuario = ?',
            [dni_persona, correo_usuario, nombre_usuario]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ mensaje: 'El DNI, correo o nombre de usuario ya existen en el sistema' });
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
            "CALL crearPersona(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",  // 12 parámetros
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
        const cod_persona = result.cod_persona; // ID de la persona recién insertada

        // Verificar si cod_persona se obtuvo correctamente
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

        // Obtener o crear el rol (Cod_rol) en tbl_roles
        const [rolResult] = await connection.query(
            'INSERT INTO tbl_roles (Descripcion) VALUES (?) ON DUPLICATE KEY UPDATE Cod_rol=LAST_INSERT_ID(Cod_rol)',
            [descripcion_rol]  // Pasa la descripción del rol
        );
        const cod_rol = rolResult.insertId || rolResult[0].Cod_rol;  // Aquí se obtiene el Cod_rol

        // Generar token
        const token_usuario = Generar_Id(); // Definir token_usuario aquí

        // Hashear la contraseña antes de insertarla
        const saltRounds = 10; 
        const hashedPassword = await bcrypt.hash(contraseña_usuario, saltRounds);
        
        // Mapear el estado de la persona a "Activo" o "Inactivo"
        const estadoValido = (Estado_Persona === 'A') ? 'Activo' : 'Inactivo';

        // Insertar o actualizar el estado del usuario
        const [estadoUsuarioResult] = await connection.query(
            'INSERT INTO tbl_estado_usuario (estado) VALUES (?) ON DUPLICATE KEY UPDATE Cod_estado_usuario=LAST_INSERT_ID(Cod_estado_usuario)',
            [estadoValido] 
        );
        
        const cod_estado_usuario = estadoUsuarioResult.insertId || estadoUsuarioResult[0].Cod_estado_usuario;
        
        // Crear el usuario con el cod_persona, cod_rol y la contraseña hasheada
        const [nuevoUsuario] = await connection.query(
            'CALL crearUsuario(?, ?, ?, ?, ?, ?, ?, ?)', 
            [nombre_usuario, correo_usuario, hashedPassword, cod_estado_usuario, token_usuario, cod_persona, cod_rol, new Date()]  // Pasar null para que el procedimiento use CURDATE()
        );

        // Respuesta exitosa
        res.status(201).json({ mensaje: 'Usuario registrado correctamente', usuario: nuevoUsuario });
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        res.status(500).json({ mensaje: 'Error al crear el usuario' });
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

//con este se confirma la cuenta del usuario con el token enviado en el correo y se actualiza el estado de confirmacion y se elimina el token
export const confirmarCuenta = async (req, res) => {
    const { token_usuario } = req.params; // Leer el token desde los parámetros de la URL

    try {
        const db = await conectarDB();

        // Consulta para verificar el token en la base de datos
        const [rows] = await db.query('SELECT * FROM tbl_usuarios WHERE token_usuario = ?', [token_usuario]);

        if (rows.length > 0) {
            // Si se encuentra el usuario, actualizar el estado de confirmación y eliminar el token
            await db.query(
                'UPDATE tbl_usuarios SET confirmacion_email = 1, token_usuario = "" WHERE token_usuario = ?', 
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

// Eliminar un usuario y su persona asociada
export const eliminarUsuario = async (req, res) => {
    const cod_usuario = req.params.cod_usuario; // Asegúrate de que esto contenga solo el ID del usuario a eliminar.

    const connection = await pool.getConnection();
    try {
        // Primero, obtenemos el cod_persona asociado al usuario
        const [usuario] = await connection.query('SELECT cod_persona FROM tbl_usuarios WHERE cod_usuario = ?', [cod_usuario]);

        if (usuario.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const cod_persona = usuario[0].cod_persona;

        // Eliminar el usuario
        await connection.query('DELETE FROM tbl_usuarios WHERE cod_usuario = ?', [cod_usuario]);

        // Luego eliminar la persona asociada
        const result = await connection.query('DELETE FROM tbl_personas WHERE cod_persona = ?', [cod_persona]);

        // No es necesario verificar aquí si se eliminó la persona, ya que se elimina el usuario primero
        // Pero podemos dejarlo para asegurar que no haya un error.
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Persona no encontrada o ya eliminada' });
        }

        // Respuesta exitosa al eliminar el usuario y la persona
        res.status(200).json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar el usuario y la persona' });
    } finally {
        connection.release();
    }
};

//con este controlador se autentica un usuario y se genera un token jwt
export const autenticarUsuario = async (req, res) => {
    const { identificador, contraseña_usuario } = req.body; // Cambia el nombre a 'identificador'

    try {
        // Modifica la consulta para verificar el nombre de usuario o el correo electrónico
        const [user] = await pool.query(
            'SELECT * FROM tbl_usuarios WHERE nombre_usuario = ? OR correo_usuario = ?',
            [identificador, identificador] // Usa el mismo valor para ambas condiciones
        );

        // Verificar si el usuario existe
        if (user.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const usuario = user[0];

        // Verificar la contraseña 
        const contraseñaValida = await bcrypt.compare(contraseña_usuario, usuario.contraseña_usuario);
        if (!contraseñaValida) {
            return res.status(401).json({ mensaje: 'Contraseña o nombre de usuario/correo incorrecto' });
        }

        // Verificar si el usuario ha confirmado su cuenta
        if (usuario.confirmacion_email !== 1) { // Cambia a 1 para verificar la confirmación
            return res.status(403).json({ mensaje: 'Cuenta no confirmada. Por favor, verifica tu correo electrónico.' });
        }

        // Generar el token JWT
        const token = jwt.sign(
            { cod_usuario: usuario.cod_usuario, nombre_usuario: usuario.nombre_usuario, rol_usuario: usuario.rol_usuario },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Responder con el token
        res.status(200).json({
            mensaje: 'Autenticación exitosa',
            token
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al autenticar usuario' });
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


