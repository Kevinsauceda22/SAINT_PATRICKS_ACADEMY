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

// Función para validar datos del profesor
const validarDatosProfesor = (profesorData) => {
    const camposRequeridos = [
        'Cod_grado_academico',
        'Cod_tipo_contrato',
        'Hora_entrada',
        'Hora_salida',
        'Fecha_ingreso',
        'Años_experiencia'
    ];

    for (const campo of camposRequeridos) {
        if (!profesorData[campo]) {
            throw new Error(`El campo ${campo} es requerido para el registro del profesor`);
        }
    }

    // Validar formato de hora
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    if (!timeRegex.test(profesorData.Hora_entrada) || !timeRegex.test(profesorData.Hora_salida)) {
        throw new Error('Formato de hora inválido');
    }

    // Validar fecha de ingreso
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(profesorData.Fecha_ingreso)) {
        throw new Error('Formato de fecha de ingreso inválido');
    }

    // Validar fecha fin contrato si existe
    if (profesorData.Fecha_fin_contrato && !dateRegex.test(profesorData.Fecha_fin_contrato)) {
        throw new Error('Formato de fecha fin de contrato inválido');
    }

    // Validar años de experiencia
    if (typeof profesorData.Años_experiencia !== 'number' || 
        profesorData.Años_experiencia < 0 || 
        profesorData.Años_experiencia > 99) {
        throw new Error('Años de experiencia debe ser un número entre 0 y 99');
    }
};


export const crearPersonaYUsuario = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const { personData, userData, profesorData  } = req.body;
        const rolId = parseInt(userData.Cod_rol);

        // Validar rol
        if (![1, 2, 3, 4].includes(rolId)) {
            return res.status(400).json({
                status: false,
                mensaje: 'Rol no válido'
            });
        }

         // Validar datos específicos de profesor si el rol es docente
         if (rolId === 3) {
            try {
                validarDatosProfesor(profesorData);
            } catch (error) {
                await connection.rollback();
                return res.status(400).json({
                    status: false,
                    mensaje: error.message
                });
            }

            // Validar existencia de grado académico
            const [gradoExiste] = await connection.query(
                'SELECT Cod_grado_academico FROM tbl_grado_academico WHERE Cod_grado_academico = ?',
                [profesorData.Cod_grado_academico]
            );

            if (gradoExiste.length === 0) {
                await connection.rollback();
                return res.status(400).json({
                    status: false,
                    mensaje: 'El grado académico especificado no existe'
                });
            }

            // Validar existencia de tipo de contrato
            const [contratoExiste] = await connection.query(
                'SELECT Cod_tipo_contrato FROM tbl_tipo_contrato WHERE Cod_tipo_contrato = ?',
                [profesorData.Cod_tipo_contrato]
            );

            if (contratoExiste.length === 0) {
                await connection.rollback();
                return res.status(400).json({
                    status: false,
                    mensaje: 'El tipo de contrato especificado no existe'
                });
            }

            // Validar que la fecha fin de contrato sea posterior a la fecha de ingreso
            if (profesorData.Fecha_fin_contrato) {
                const fechaIngreso = new Date(profesorData.Fecha_ingreso);
                const fechaFin = new Date(profesorData.Fecha_fin_contrato);
                if (fechaFin <= fechaIngreso) {
                    await connection.rollback();
                    return res.status(400).json({
                        status: false,
                        mensaje: 'La fecha de fin de contrato debe ser posterior a la fecha de ingreso'
                    });
                }
            }
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

        // Validar nacionalidad
        if (personData.Id_nacionalidad) {
            const [existingNationality] = await connection.query(
                'SELECT Cod_nacionalidad FROM tbl_nacionalidad WHERE Cod_nacionalidad = ?',
                [personData.Id_nacionalidad]
            );

            if (existingNationality.length === 0) {
                await connection.rollback();
                return res.status(400).json({
                    status: false,
                    mensaje: 'La nacionalidad seleccionada no es válida'
                });
            }
        }

        // Generar credenciales
        const temporaryPassword = generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
        
        // Generar nombre de usuario del correo electrónico
        const nombre_usuario = userData.correo_usuario
            .split('@')[0]              
            .toLowerCase()              
            .normalize('NFD')           
            .replace(/[\u0300-\u036f]/g, '')  
            .replace(/[^a-z0-9._]/g, '');     

        // Verificar si el nombre de usuario ya existe
        const [existingUsername] = await connection.query(
            'SELECT nombre_usuario FROM tbl_usuarios WHERE nombre_usuario = ?',
            [nombre_usuario]
        );

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
                Cod_nacionalidad,
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
                personData.Cod_nacionalidad || null,
                personData.direccion_persona || null,
                personData.fecha_nacimiento || null,
                'A',
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

        // 4. Si es profesor, insertar en tabla de profesores
        if (rolId === 3) {
            await connection.query(
                `INSERT INTO tbl_profesores (
                    cod_persona,
                    Cod_grado_academico,
                    Cod_tipo_contrato,
                    Hora_entrada,
                    Hora_salida,
                    Fecha_ingreso,
                    Fecha_fin_contrato,
                    Años_experiencia
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    cod_persona,
                    profesorData.Cod_grado_academico,
                    profesorData.Cod_tipo_contrato,
                    profesorData.Hora_entrada,
                    profesorData.Hora_salida,
                    profesorData.Fecha_ingreso,
                    profesorData.Fecha_fin_contrato || null,
                    profesorData.Años_experiencia
                ]
            );
        }


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

export const getGradosAcademicos = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const [grados] = await connection.query('SELECT * FROM tbl_grado_academico ORDER BY Descripcion');
        res.json({
            status: true,
            data: grados
        });
    } catch (error) {
        console.error('Error al obtener grados académicos:', error);
        res.status(500).json({
            status: false,
            mensaje: 'Error al obtener grados académicos',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

export const getTiposContrato = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const [tipos] = await connection.query('SELECT * FROM tbl_tipo_contrato ORDER BY Descripcion');
        res.json({
            status: true,
            data: tipos
        });
    } catch (error) {
        console.error('Error al obtener tipos de contrato:', error);
        res.status(500).json({
            status: false,
            mensaje: 'Error al obtener tipos de contrato',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

export const getProfesorByPersonaId = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { cod_persona } = req.params;
        
        const [profesor] = await connection.query(
            `SELECT 
                p.*,
                ga.Descripcion as grado_academico_descripcion,
                tc.Descripcion as tipo_contrato_descripcion
             FROM tbl_profesores p
             JOIN tbl_grado_academico ga ON p.Cod_grado_academico = ga.Cod_grado_academico
             JOIN tbl_tipo_contrato tc ON p.Cod_tipo_contrato = tc.Cod_tipo_contrato
             WHERE p.cod_persona = ?`,
            [cod_persona]
        );

        if (profesor.length === 0) {
            return res.status(404).json({
                status: false,
                mensaje: 'Profesor no encontrado'
            });
        }

        res.json({
            status: true,
            data: profesor[0]
        });
    } catch (error) {
        console.error('Error al obtener datos del profesor:', error);
        res.status(500).json({
            status: false,
            mensaje: 'Error al obtener datos del profesor',
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