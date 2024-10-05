import pool from '../../../config/db.js'; // Importar conexión a la base de datos


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
        Valor
    } = req.body;

    try {
        await pool.query('CALL insert_actividad_academica(?, ?, ?, ?, ?, ?, ?, ?)', [
            Cod_profesor,
            Cod_ponderacion_ciclo,
            Cod_parcial,
            Nombre_actividad_academica,
            Descripcion,
            Fechayhora_Inicio,
            Fechayhora_Fin,
            Valor
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
        Valor
    } = req.body;

    console.log('Datos recibidos para actualizar la actividad:', req.body); // Agregado para verificar datos

    try {
        await pool.query('CALL update_actividad_academica(?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            Cod_actividad_academica,
            Cod_profesor,
            Cod_ponderacion_ciclo,
            Cod_parcial,
            Nombre_actividad_academica,
            Descripcion,
            Fechayhora_Inicio,
            Fechayhora_Fin,
            Valor
        ]);

        res.status(200).json({ Mensaje: 'Actividad académica actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar la actividad académica:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
