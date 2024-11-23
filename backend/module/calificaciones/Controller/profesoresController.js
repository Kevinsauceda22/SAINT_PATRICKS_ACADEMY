import conectarDB from '../../../config/db.js';
import jwt from 'jsonwebtoken'; // Importa jwt si no lo has hecho
const pool = await conectarDB();

// Obtener todos los profesores y sus datos asociados
export const obtenerProfesores = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL get_all_profesores()');
        
        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron profesores' });
        }
    } catch (error) {
        console.error('Error al obtener la lista de profesores:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Crear un nuevo profesor en la base de datos
export const crearProfesor = async (req, res) => {
    const {
        cod_persona,
        Cod_grado_academico,
        Cod_tipo_contrato,
        Hora_entrada,
        Hora_salida,
        Fecha_ingreso,
        Fecha_fin_contrato,
        Años_experiencia
    } = req.body;

    try {
        await pool.query('CALL insert_profesor(?, ?, ?, ?, ?, ?, ?, ?)', [
            cod_persona,
            Cod_grado_academico,
            Cod_tipo_contrato,
            Hora_entrada,
            Hora_salida,
            Fecha_ingreso,
            Fecha_fin_contrato,
            Años_experiencia
        ]);

        res.status(201).json({ Mensaje: 'Profesor agregado exitosamente' });
    } catch (error) {
        console.error('Error al agregar el profesor:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Actualizar un profesor
export const actualizarProfesor = async (req, res) => {
    const {
        Cod_profesor, // Asegúrate de que este campo esté en el cuerpo de la solicitud
        cod_persona,
        Cod_grado_academico,
        Cod_tipo_contrato,
        Hora_entrada,
        Hora_salida,
        Fecha_ingreso,
        Fecha_fin_contrato,
        Años_experiencia
    } = req.body;

   // console.log('Datos recibidos:', req.body); // Para depuración

    try {
        // Llama al procedimiento almacenado que actualiza un profesor
        await pool.query('CALL update_profesor(?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            Cod_profesor,
            cod_persona,
            Cod_grado_academico,
            Cod_tipo_contrato,
            Hora_entrada,
            Hora_salida,
            Fecha_ingreso,
            Fecha_fin_contrato,
            Años_experiencia
        ]);

        res.status(200).json({ Mensaje: 'Profesor actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el profesor:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }

    
};
// Ruta para eliminar un profesor por su código
export const eliminarProfesor = async (req, res) => {
    const { Cod_profesor } = req.body;

    // Validación: Verificar que se haya proporcionado el código del profesor
    if (!Cod_profesor) {
        return res.status(400).json({ Mensaje: 'Cod_profesor es requerido' });
    }

    try {
        // Llamada al procedimiento almacenado para eliminar el profesor
        await pool.query('CALL delete_profesor(?)', [Cod_profesor]);

        // Respuesta exitosa
        res.status(200).json({ Mensaje: 'Profesor eliminado exitosamente' });
    } catch (error) {
        // Manejo de errores
        console.error('Error al eliminar el profesor:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
    
};
