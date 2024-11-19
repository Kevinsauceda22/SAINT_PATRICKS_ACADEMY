// Importar la conexión a la base de datos
import conectarDB from '../../../config/db.js';
const pool = await conectarDB(); // Establecer el pool de conexiones

// Controlador para obtener todas las secciones
export const get_seccionesP = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL get_seccionesP()'); // Llamar al procedimiento almacenado
        res.json(rows[0]); // Devolver el primer conjunto de resultados
    } catch (error) {
        console.error('Error al obtener las secciones:', error);
        res.status(500).json({ message: error.message }); // Manejo de errores
    }
};

// Controlador para crear una nueva sección
export const createSeccion = async (req, res) => {
    const { Nombre_seccion } = req.body; // Obtener el nombre de la sección del cuerpo de la solicitud
    try {
        const [result] = await pool.query('CALL create_seccion(?)', [Nombre_seccion]); // Llamar al procedimiento almacenado
        res.json({ message: 'Sección creada correctamente', id: result.insertId }); // Devolver el ID de la nueva sección
    } catch (error) {
        console.error('Error al crear la sección:', error);
        res.status(500).json({ message: error.message }); // Manejo de errores
    }
};

// Controlador para actualizar una sección existente
export const updateSeccion = async (req, res) => {
    const { id } = req.params; // Obtener el ID de la sección desde los parámetros de la ruta
    const { Nombre_seccion } = req.body; // Obtener el nuevo nombre de la sección del cuerpo de la solicitud
    try {
        await pool.query('CALL update_seccion(?, ?)', [id, Nombre_seccion]); // Llamar al procedimiento almacenado
        res.json({ message: 'Sección actualizada correctamente' }); // Confirmar la actualización
    } catch (error) {
        console.error('Error al actualizar la sección:', error);
        res.status(500).json({ message: error.message }); // Manejo de errores
    }
};

// Controlador para eliminar una sección
export const deleteSeccion = async (req, res) => {
    const { id } = req.params; // Obtener el ID de la sección desde los parámetros de la ruta
    try {
        await pool.query('CALL delete_seccion(?)', [id]); // Llamar al procedimiento almacenado
        res.json({ message: 'Sección eliminada correctamente' }); // Confirmar la eliminación
    } catch (error) {
        console.error('Error al eliminar la sección:', error);
        res.status(500).json({ message: error.message }); // Manejo de errores
    }
};
