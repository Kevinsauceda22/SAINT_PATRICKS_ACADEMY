import conectarDB from '../../../config/db.js';
const pool = await conectarDB();



// Obtener todas las actividades académicas
export const obtenerActividadesAcademicas = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL get_all_actividades_academicas()');

        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'No se encontraron actividades académicas' });
        }
    } catch (error) {
        console.error('Error al obtener las actividades académicas:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// Obtener  las actividades académicas por codigo
export const getActividadesPorProfesor = async (req, res) => {
    const { Cod_profesor } = req.params;

    try {
        const [rows] = await pool.query('CALL ver_actividades_por_profesor(?)', [Cod_profesor]);
        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ message: 'No se encontraron actividades académicas para este profesor.' });
        }
    } catch (error) {
        console.error("Error al obtener actividades para el profesor:", error);
        res.status(500).json({ error: "Error al obtener actividades para el profesor" });
    }
};




// Crear una nueva actividad académica
export const crearActividadAcademica = async (req, res) => {
    const {
        Cod_profesor,
        Cod_ponderacion_ciclo,
        Cod_parcial,
        Nombre_actividad_academica,
        Descripcion,
        Fechayhora_Inicio,
        Fechayhora_Fin,
        Valor,
        Cod_secciones
    } = req.body;

    try {
        await pool.query('CALL insert_actividad_academica(?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            Cod_profesor,
            Cod_ponderacion_ciclo,
            Cod_parcial,
            Nombre_actividad_academica,
            Descripcion,
            Fechayhora_Inicio,
            Fechayhora_Fin,
            Valor,
            Cod_secciones
        ]);

        res.status(201).json({ Mensaje: 'Actividad académica creada exitosamente' });
    } catch (error) {
        console.error('Error al crear la actividad académica:', error);
        res.status(500).json({ message: 'Error en el servidor', error: error.message });
    }
};

// Actualizar una actividad académica
export const actualizarActividadAcademica = async (req, res) => {
    const {
        Cod_actividad_academica,
        Cod_profesor,
        Cod_ponderacion_ciclo,
        Cod_parcial,
        Nombre_actividad_academica,
        Descripcion,
        Fechayhora_Inicio,
        Fechayhora_Fin,
        Valor,
        Cod_secciones
    } = req.body;

   // console.log('Datos recibidos para actualizar la actividad:', req.body); // Agregado para verificar datos

    try {
        await pool.query('CALL update_actividad_academica(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            Cod_actividad_academica,
            Cod_profesor,
            Cod_ponderacion_ciclo,
            Cod_parcial,
            Nombre_actividad_academica,
            Descripcion,
            Fechayhora_Inicio,
            Fechayhora_Fin,
            Valor,
            Cod_secciones
        ]);

        res.status(200).json({ Mensaje: 'Actividad académica actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar la actividad académica:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }

    
};


export const eliminarActividadAcademica = async (req, res) => {
    const { Cod_actividad_academica } = req.body;

    // Validación: Verificar que se haya proporcionado el código de la actividad académica
    if (!Cod_actividad_academica) {
        return res.status(400).json({ Mensaje: 'Cod_actividad_academica es requerido' });
    }

    try {
        // Llamada al procedimiento almacenado para eliminar la actividad académica
        await pool.query('CALL eliminar_actividad_academica(?)', [Cod_actividad_academica]);

        // Respuesta exitosa
        res.status(200).json({ Mensaje: 'Actividad académica eliminada exitosamente' });
    } catch (error) {
        // Manejo de errores
        console.error('Error al eliminar la actividad académica:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};