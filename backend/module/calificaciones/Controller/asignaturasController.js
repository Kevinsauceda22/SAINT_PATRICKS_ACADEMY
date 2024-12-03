import conectarDB from '../../../config/db.js';
import jwt from 'jsonwebtoken';
const pool = await conectarDB();


// Obtener todas las asignaturas
export const obtenerAsignaturas = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL get_all_asignaturas()');

        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron las asignaturas' });
        }
    } catch (error) {
        console.error('Error al obtener la lista de asignaturas:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Crear una nueva asignatura
export const crearAsignatura = async (req, res) => {
    const { Nombre_asignatura, Descripcion_asignatura } = req.body;

    try {
        await pool.query('CALL insert_asignatura(?, ?)', [
            Nombre_asignatura,
            Descripcion_asignatura
        ]);

        res.status(201).json({ Mensaje: 'Asignatura creada exitosamente' });
    } catch (error) {
        console.error('Error al agregar la asignatura:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Actualizar una asignatura
export const actualizarAsignatura = async (req, res) => {
    const { Cod_asignatura, Nombre_asignatura, Descripcion_asignatura } = req.body;

   // console.log('Datos recibidos:', req.body); // Agregado para verificar datos

    try {
        await pool.query('CALL update_asignatura(?, ?, ?)', [
            Cod_asignatura,
            Nombre_asignatura,
            Descripcion_asignatura
        ]);

        res.status(200).json({ Mensaje: 'Asignatura actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar la asignatura:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Eliminar una asignatura
export const eliminarAsignatura = async (req, res) => {  
    const { Cod_asignatura } = req.body;  

    if (!Cod_asignatura) {
        return res.status(400).json({ Mensaje: 'Cod_asignatura es requerido' });
    }

    try {  
        await pool.query('CALL delete_asignatura(?)', [Cod_asignatura]);  
        res.status(200).json({ Mensaje: 'Asignatura eliminada exitosamente' });  
    } catch (error) {  
        console.error('Error al eliminar la asignatura:', error);  
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });  
    }  
};






//----------------------------------------------------------------------------------------Parte Ariel ------------------------------------------------------------------








export const obtenerAsignaturasPorProfesor = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ mensaje: 'Token no proporcionado' });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const codPersona = decodedToken.cod_persona;
        if (!codPersona) {
            return res.status(400).json({ mensaje: 'El token no contiene cod_persona' });
        }

        const [profesorResult] = await pool.query(
            'SELECT Cod_Profesor FROM tbl_profesores WHERE Cod_Persona = ?',
            [codPersona]
        );

        if (profesorResult.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontró un profesor con este cod_persona' });
        }

        const codProfesor = profesorResult[0].Cod_Profesor;

        // Obtener `codSeccion` desde los parámetros
        const { codSeccion } = req.params;

        // Llamar al procedimiento almacenado
        const [asignaturas] = await pool.query(
            'CALL ObtenerAsignaturasPorProfesor(?, ?)', 
            [codProfesor, codSeccion]
        );

        if (!asignaturas || asignaturas.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron asignaturas para esta sección.' });
        }

        res.status(200).json(asignaturas[0]); // Retornar asignaturas correctamente
    } catch (error) {
        console.error('Error al obtener las asignaturas:', error);
        res.status(500).json({ mensaje: 'Error al obtener las asignaturas.', error: error.message });
    }
};
