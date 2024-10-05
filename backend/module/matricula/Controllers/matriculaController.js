import conectarDB from '../../../config/db.js';

let pool;

// Inicializar la conexión a la base de datos
const initDB = async () => {
    pool = await conectarDB();
};

initDB();

// Controlador para crear una matrícula
export const crearMatricula = async (req, res) => {
    const {
        p_fecha_matricula,
        p_Cod_persona,
        p_tipo_estado,
        p_Fecha_inicio,
        p_Fecha_fin,
        p_anio_academico,
        p_tipo_matricula,
        p_Tipo_transaccion,
        p_Monto,
        p_Descripcion_caja,
        p_Cod_concepto
    } = req.body;

    try {
        // Ejecutar la consulta del procedimiento almacenado
        await pool.query('CALL insertar_matricula(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            p_fecha_matricula,
            p_Cod_persona,
            p_tipo_estado,
            p_Fecha_inicio,
            p_Fecha_fin,
            p_anio_academico,
            p_tipo_matricula,
            p_Tipo_transaccion,
            p_Monto,
            p_Descripcion_caja,
            p_Cod_concepto
        ]);

        // Respuesta exitosa
        res.status(201).json({ Mensaje: 'Matrícula creada exitosamente' });
    } catch (error) {
        console.error('Error al crear la matrícula:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

