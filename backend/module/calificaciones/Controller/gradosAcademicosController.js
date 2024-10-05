import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


// Obtener todos los grados académicos
export const obtenerGradosAcademicos = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL get_all_grado_academico()');

        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron grados académicos' });
        }
    } catch (error) {
        console.error('Error al obtener los grados académicos:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Crear un nuevo grado académico
export const crearGradoAcademico = async (req, res) => {
    const { Descripcion } = req.body;

    try {
        await pool.query('CALL insert_grado_academico(?)', [Descripcion]);
        res.status(201).json({ Mensaje: 'Grado académico creado exitosamente' });
    } catch (error) {
        console.error('Error al crear el grado académico:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Actualizar un grado académico
export const actualizarGradoAcademico = async (req, res) => {
    const { Cod_grado_academico, Descripcion } = req.body;

    try {
        await pool.query('CALL update_grado_academico(?, ?)', [
            Cod_grado_academico,
            Descripcion
        ]);
        res.status(200).json({ Mensaje: 'Grado académico actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el grado académico:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Eliminar un grado académico
export const eliminarGradoAcademico = async (req, res) => {
    const { Cod_grado_academico } = req.body;

    if (!Cod_grado_academico) {
        return res.status(400).json({ Mensaje: 'Cod_grado_academico es requerido' });
    }

    try {
        await pool.query('CALL delete_grado_academico(?)', [Cod_grado_academico]);
        res.status(200).json({ Mensaje: 'Grado académico eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el grado académico:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
