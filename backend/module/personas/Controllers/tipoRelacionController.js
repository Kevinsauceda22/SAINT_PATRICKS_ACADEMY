import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


//Controlador para obtener todas las relaciones
export const obtenerTodoTipoRelacion = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL P_Get_TipoRelacion()');

        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron las tipos relaciones' });
        }
    } catch (error) {
        console.error('Error al obtener la lista de tipo relaciones:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};



//Controlador para crear tipo relacion
export const crearTipoRelacion = async (req, res) => {
    const {
        tipo_relacion
    } = req.body;

    try {
        await pool.query('CALL P_Post_TipoRelacion(?)', [
            tipo_relacion
        ]);

        res.status(201).json({ mensaje: 'tipo relacion creada exitosamente' });
    } catch (error) {
        console.error('Error al crear tipo relacion:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};


// Controlador para actualiza tipo relacion
export const actualizarTipoRelacion = async (req, res) => {
    const { Cod_tipo_relacion } = req.params; // Obtiene el código del aula desde la URL

    const {
        tipo_relacion
    } = req.body;

    try {
        await pool.query('CALL P_Put_TipoRelacion(?, ?)', [
            Cod_tipo_relacion,
            tipo_relacion
        ]);

        res.status(200).json({ mensaje: 'Tipo relacion actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Eliminar tipo Relacion
export const eliminarTipoRelacion = async (req, res) => {  
    const { Cod_tipo_relacion } = req.params;  

    if (!Cod_tipo_relacion) {
        return res.status(400).json({ Mensaje: 'Cod_tipo_relacion es requerido' });
    }

    try {  
        await pool.query('CALL 	P_Delete_TipoRelacion(?)', [Cod_tipo_relacion]);  
        res.status(200).json({ Mensaje: 'Tipo relación eliminada exitosamente' });  
    } catch (error) {  
        console.error('Error al eliminar tipo relación:', error);  
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });  
    }  
};
