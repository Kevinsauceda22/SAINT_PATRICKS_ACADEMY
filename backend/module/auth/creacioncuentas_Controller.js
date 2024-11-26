import conectarDB from '../../config/db.js';
const pool = await conectarDB();

import bcrypt from "bcrypt";
import { generateTemporaryPassword } from "../../utils/passwordUtils.js";
import { enviarCorreoCredencialesTemporales } from "../../helpers/emailHelper.js";

const getRoleName = (roleId) => {
    const roles = {
        1: 'Padre',
        2: 'Administrador',
        3: 'Docente',
        4: 'Manager'
    };
    return roles[roleId] || 'Usuario';
};

export const crearPersonaYUsuario = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const { personData, userData } = req.body;
        const rolId = parseInt(userData.Cod_rol);

        // Validar rol
        if (![1, 2, 3, 4].includes(rolId)) {
            return res.status(400).json({
                status: false,
                mensaje: 'Rol no válido'
            });
        }

        // 1. Verificar existencia previa
        const [existingUser] = await connection.query(
            'SELECT * FROM tbl_usuarios WHERE correo_usuario = ?',
            [userData.correo_usuario]
        );

        const [existingPerson] = await connection.query(
            'SELECT * FROM tbl_personas WHERE dni_persona = ?',
            [personData.dni_persona]
        );

        if (existingUser.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                status: false,
                mensaje: 'Ya existe un usuario con este correo electrónico'
            });
        }

        if (existingPerson.length > 0) {
            await connection.rollback();
            return res.status(400).json({
                status: false,
                mensaje: 'Ya existe una persona con este número de documento'
            });
        }

        // Generar credenciales
        const temporaryPassword = generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
        
        // Generar nombre de usuario del correo electrónico
        const nombre_usuario = userData.correo_usuario
            .split('@')[0]              // Tomar la parte antes del @
            .toLowerCase()              // Convertir a minúsculas
            .normalize('NFD')           // Normalizar caracteres especiales
            .replace(/[\u0300-\u036f]/g, '')  // Eliminar acentos
            .replace(/[^a-z0-9._]/g, '');     // Solo permitir letras, números, puntos y guiones bajos

        // Verificar si el nombre de usuario ya existe
        const [existingUsername] = await connection.query(
            'SELECT nombre_usuario FROM tbl_usuarios WHERE nombre_usuario = ?',
            [nombre_usuario]
        );

        // Si existe, añadir un número aleatorio al final
        let finalUsername = nombre_usuario;
        if (existingUsername.length > 0) {
            const randomNum = Math.floor(Math.random() * 1000);
            finalUsername = `${nombre_usuario}${randomNum}`;
        }

        // 2. Insertar persona
        const [resultPersona] = await connection.query(
            `INSERT INTO tbl_personas (
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
                cod_municipio,
                cod_genero
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                personData.dni_persona,
                personData.Nombre,
                personData.Segundo_nombre || null,
                personData.Primer_apellido,
                personData.Segundo_apellido || null,
                personData.Nacionalidad || null,
                personData.direccion_persona || null,
                personData.fecha_nacimiento || null,
                'A', // Estado activo por defecto
                personData.cod_tipo_persona,
                personData.cod_departamento,
                personData.cod_municipio,
                personData.cod_genero
            ]
        );

        const cod_persona = resultPersona.insertId;

        // 3. Insertar usuario
        const [resultUsuario] = await connection.query(
            `INSERT INTO tbl_usuarios (
                nombre_usuario,
                correo_usuario,
                contraseña_usuario,
                token_usuario,
                confirmacion_email,
                cod_persona,
                Cod_rol,
                Cod_estado_usuario,
                is_two_factor_enabled,
                otp_verified,
                datos_completados,
                password_temporal,
                Primer_ingreso,
                Fecha_ultima_conexion
            ) VALUES (?, ?, ?, NULL, 1, ?, ?, 1, 0, 0, 1, 1, NOW(), NOW())`,
            [
                finalUsername,
                userData.correo_usuario,
                hashedPassword,
                cod_persona,
                rolId
            ]
        );

        // Insertar historia de contraseña
        await connection.query(
            `INSERT INTO tbl_hist_contraseña (
                Cod_usuario,
                Contraseña
            ) VALUES (?, ?)`,
            [resultUsuario.insertId, hashedPassword]
        );

        // 4. Enviar correo con credenciales
        await enviarCorreoCredencialesTemporales(
            userData.correo_usuario,
            finalUsername,
            temporaryPassword,
            getRoleName(rolId)
        );

        await connection.commit();

        res.status(201).json({
            status: true,
            mensaje: `${getRoleName(rolId)} creado exitosamente. Se han enviado las credenciales por correo electrónico.`,
            data: {
                cod_persona,
                cod_usuario: resultUsuario.insertId,
                nombre_usuario: finalUsername,
                rol: getRoleName(rolId),
                correo: userData.correo_usuario
            }
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error al crear persona y usuario:', error);
        res.status(500).json({
            status: false,
            mensaje: 'Error al crear el usuario',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

export const actualizarPasswordPrimerIngreso = async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { cod_usuario, nueva_contraseña } = req.body;

        const [user] = await connection.query(
            'SELECT password_temporal FROM tbl_usuarios WHERE cod_usuario = ?',
            [cod_usuario]
        );

        if (user.length === 0) {
            return res.status(404).json({
                status: false,
                mensaje: 'Usuario no encontrado'
            });
        }

        const hashedPassword = await bcrypt.hash(nueva_contraseña, 10);

        const [result] = await connection.query(
            `UPDATE tbl_usuarios 
            SET contraseña_usuario = ?,
                password_temporal = 0,
                ultima_actualizacion = CURRENT_TIMESTAMP,
                Fecha_ultima_conexion = NOW()
            WHERE cod_usuario = ?`,
            [hashedPassword, cod_usuario]
        );

        // Actualizar historia de contraseña
        await connection.query(
            `INSERT INTO tbl_hist_contraseña (
                Cod_usuario,
                Contraseña
            ) VALUES (?, ?)`,
            [cod_usuario, hashedPassword]
        );

        res.json({
            status: true,
            mensaje: 'Contraseña actualizada correctamente'
        });

    } catch (error) {
        console.error('Error al actualizar la contraseña:', error);
        res.status(500).json({
            status: false,
            mensaje: 'Error al actualizar la contraseña',
            error: error.message
        });
    } finally {
        connection.release();
    }
};