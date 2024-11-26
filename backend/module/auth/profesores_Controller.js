import conectarDB from '../../config/db.js';
const pool = await conectarDB();

// Obtener todos los grados académicos
export const getGradosAcademicos = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query('SELECT * FROM tbl_grados_academicos ORDER BY Descripcion');
        
        if (rows.length === 0) {
            return res.status(404).json({
                status: false,
                msg: 'No se encontraron grados académicos'
            });
        }

        return res.json({
            status: true,
            msg: 'Grados académicos recuperados correctamente',
            data: rows
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            msg: 'Error al obtener los grados académicos',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Obtener todos los tipos de contrato
export const getTiposContrato = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const [rows] = await connection.query('SELECT * FROM tbl_tipos_contratos ORDER BY Descripcion');
        
        if (rows.length === 0) {
            return res.status(404).json({
                status: false,
                msg: 'No se encontraron tipos de contrato'
            });
        }

        return res.json({
            status: true,
            msg: 'Tipos de contrato recuperados correctamente',
            data: rows
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            msg: 'Error al obtener los tipos de contrato',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Obtener profesor por ID
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
             JOIN tbl_grados_academicos ga ON p.Cod_grado_academico = ga.Cod_grado_academico
             JOIN tbl_tipos_contratos tc ON p.Cod_tipo_contrato = tc.Cod_tipo_contrato
             WHERE p.cod_persona = ?`,
            [cod_persona]
        );

        if (profesor.length === 0) {
            return res.status(404).json({
                status: false,
                msg: 'Profesor no encontrado'
            });
        }

        return res.json({
            status: true,
            msg: 'Profesor recuperado correctamente',
            data: profesor[0]
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            msg: 'Error al obtener los datos del profesor',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Obtener todos los profesores
export const getAllProfesores = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const [profesores] = await connection.query(
            `SELECT 
                p.*,
                per.Nombre,
                per.Primer_apellido,
                per.Segundo_apellido,
                per.dni_persona,
                ga.Descripcion as grado_academico,
                tc.Descripcion as tipo_contrato,
                u.correo_usuario,
                u.Cod_estado_usuario
             FROM tbl_profesores p
             INNER JOIN tbl_personas per ON p.cod_persona = per.cod_persona
             INNER JOIN tbl_grados_academicos ga ON p.Cod_grado_academico = ga.Cod_grado_academico
             INNER JOIN tbl_tipos_contratos tc ON p.Cod_tipo_contrato = tc.Cod_tipo_contrato
             INNER JOIN tbl_usuarios u ON per.cod_persona = u.cod_persona
             ORDER BY per.Primer_apellido, per.Nombre`
        );

        if (profesores.length === 0) {
            return res.status(404).json({
                status: false,
                msg: 'No se encontraron profesores'
            });
        }

        return res.json({
            status: true,
            msg: 'Profesores recuperados correctamente',
            data: profesores
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            msg: 'Error al obtener la lista de profesores',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Actualizar profesor
export const actualizarProfesor = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { cod_persona } = req.params;
        const {
            Cod_grado_academico,
            Cod_tipo_contrato,
            Hora_entrada,
            Hora_salida,
            Fecha_ingreso,
            Fecha_fin_contrato,
            Años_experiencia
        } = req.body;

        // Verificar si el profesor existe
        const [profesorExiste] = await connection.query(
            'SELECT cod_profesor FROM tbl_profesores WHERE cod_persona = ?',
            [cod_persona]
        );

        if (profesorExiste.length === 0) {
            return res.status(404).json({
                status: false,
                msg: 'Profesor no encontrado'
            });
        }

        // Verificar si el grado académico existe
        const [gradoExiste] = await connection.query(
            'SELECT Cod_grado_academico FROM tbl_grados_academicos WHERE Cod_grado_academico = ?',
            [Cod_grado_academico]
        );

        if (gradoExiste.length === 0) {
            return res.status(400).json({
                status: false,
                msg: 'El grado académico especificado no existe'
            });
        }

        // Verificar si el tipo de contrato existe
        const [contratoExiste] = await connection.query(
            'SELECT Cod_tipo_contrato FROM tbl_tipos_contratos WHERE Cod_tipo_contrato = ?',
            [Cod_tipo_contrato]
        );

        if (contratoExiste.length === 0) {
            return res.status(400).json({
                status: false,
                msg: 'El tipo de contrato especificado no existe'
            });
        }

        await connection.query(
            `UPDATE tbl_profesores SET
                Cod_grado_academico = ?,
                Cod_tipo_contrato = ?,
                Hora_entrada = ?,
                Hora_salida = ?,
                Fecha_ingreso = ?,
                Fecha_fin_contrato = ?,
                Años_experiencia = ?
            WHERE cod_persona = ?`,
            [
                Cod_grado_academico,
                Cod_tipo_contrato,
                Hora_entrada,
                Hora_salida,
                Fecha_ingreso,
                Fecha_fin_contrato,
                Años_experiencia,
                cod_persona
            ]
        );

        return res.json({
            status: true,
            msg: 'Datos del profesor actualizados correctamente'
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: false,
            msg: 'Error al actualizar los datos del profesor',
            error: error.message
        });
    } finally {
        connection.release();
    }
};

// Eliminar profesor (desactivación lógica)
export const eliminarProfesor = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { cod_persona } = req.params;

        // Verificar si el profesor existe
        const [profesorExiste] = await connection.query(
            'SELECT cod_profesor FROM tbl_profesores WHERE cod_persona = ?',
            [cod_persona]
        );

        if (profesorExiste.length === 0) {
            return res.status(404).json({
                status: false,
                msg: 'Profesor no encontrado'
            });
        }

        await connection.beginTransaction();

        // Actualizar estado del usuario
        await connection.query(
            `UPDATE tbl_usuarios SET Cod_estado_usuario = 2 WHERE cod_persona = ?`,
            [cod_persona]
        );

        // Actualizar estado de la persona
        await connection.query(
            `UPDATE tbl_personas SET Estado_Persona = 'I' WHERE cod_persona = ?`,
            [cod_persona]
        );

        await connection.commit();

        return res.json({
            status: true,
            msg: 'Profesor eliminado correctamente'
        });

    } catch (error) {
        await connection.rollback();
        console.log(error);
        return res.status(500).json({
            status: false,
            msg: 'Error al eliminar el profesor',
            error: error.message
        });
    } finally {
        connection.release();
    }
};