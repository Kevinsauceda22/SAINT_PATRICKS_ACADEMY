import bcrypt from 'bcrypt';
import conectarDB from '../config/db.js';

// Inicializa la conexión a la base de datos
const pool = await conectarDB();

// Crear una nueva persona y usuario
export const crearUsuario = async (req, res) => {
    const { dni_persona, nombre, primer_apellido, segundo_apellido, tipo_persona, direccion_persona, fecha_nacimiento, departamento, Estado_Persona, Genero_Persona, 
            nombre_usuario, correo_usuario, contraseña_usuario, rol_usuario, confirmacion_email, token_usuario } = req.body;

    const connection = await pool.getConnection();

    try {
        // Hashear la contraseña
        const saltRounds = 10; 
        const hashedPassword = await bcrypt.hash(contraseña_usuario, saltRounds);

        // Insertar los datos en tbl_personas
        const [personaResult] = await connection.query(
            'INSERT INTO tbl_personas (dni_persona, Nombre, primer_apellido, segundo_apellido, tipo_persona, direccion_persona, fecha_nacimiento, departamento, Estado_Persona, Genero_Persona) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [dni_persona, nombre, primer_apellido, segundo_apellido, tipo_persona, direccion_persona, fecha_nacimiento, departamento, Estado_Persona, Genero_Persona]
        );

        // Obtener el cod_persona de la persona recién creada
        const cod_persona = personaResult.insertId;

        // Crear el usuario con cod_persona y la contraseña hasheada
        const [nuevoUsuario] = await connection.query('CALL crearUsuario(?, ?, ?, ?, ?, ?, ?)', [
            nombre_usuario, correo_usuario, hashedPassword, rol_usuario, confirmacion_email, token_usuario, cod_persona
        ]);

        res.status(201).json(nuevoUsuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al crear el usuario' });
    } finally {
        connection.release();
    }
};

// Obtener todos los usuarios
export const obtenerUsuarios = async (req, res) => {
    try {
        const [usuarios] = await pool.query('CALL sp_obtener_usuarios()');
        res.status(200).json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener los usuarios' });
    }
};

// Obtener un usuario por su cod_usuario
export const obtenerUsuarioPorId = async (req, res) => {
    try {
        const [usuario] = await pool.query('CALL sp_obtener_usuario(?)', [req.params.cod_usuario]);
        if (usuario.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        res.status(200).json(usuario[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener el usuario' });
    }
};

// Actualizar un usuario
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
    const cod_usuario = req.params.cod_usuario;

    const connection = await pool.getConnection();
    try {
        // Primero, obtenemos el cod_persona asociado al usuario
        const [usuario] = await connection.query('SELECT cod_persona FROM tbl_usuarios WHERE cod_usuario = ?', [cod_usuario]);

        if (usuario.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const cod_persona = usuario[0].cod_persona;

        // Eliminar el usuario
        await connection.query('CALL sp_eliminar_usuario(?)', [cod_usuario]);

        // Luego eliminar la persona asociada
        const result = await connection.query('DELETE FROM tbl_personas WHERE cod_persona = ?', [cod_persona]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Persona no encontrada o ya eliminada' });
        }

        res.status(204).json(); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar el usuario y la persona' });
    } finally {
        connection.release();
    }
};
