import conectarDB from '../../../config/db.js';
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
