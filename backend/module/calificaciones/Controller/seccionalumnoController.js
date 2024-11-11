import conectarDB from '../../../config/db.js';
const pool = await conectarDB();

// Controlador para obtener todas las secciones
export const obtenerSecciones = async (req, res) => {
    try {
        const query = `CALL get_Secciones();`;
        const [results] = await pool.query(query);

        if (results.length === 0 || results[0].length === 0) {
            return res.status(404).json({ message: 'No se encontraron secciones' });
        }

        res.status(200).json(results[0]); // Accedemos al primer conjunto de resultados
    } catch (error) {
        console.error('Error al obtener las secciones:', error);
        res.status(500).json({ message: 'Error al obtener las secciones', error });
    }
};

// Controlador para obtener estudiantes de una sección específica
export const obtenerEstudiantesPorSeccion = async (req, res) => {
    const { id } = req.params; // Obtiene el ID de la sección desde los parámetros de la ruta

    try {
        const query = `CALL get_EstudiantesPorSeccion(?);`;
        const [results] = await pool.query(query, [id]);

        if (results.length === 0 || results[0].length === 0) {
            return res.status(404).json({ message: 'No se encontraron estudiantes en esta sección' });
        }

        res.status(200).json(results[0]); // Accedemos al primer conjunto de resultados
    } catch (error) {
        console.error('Error al obtener los estudiantes:', error);
        res.status(500).json({ message: 'Error al obtener los estudiantes', error });
    }
};
