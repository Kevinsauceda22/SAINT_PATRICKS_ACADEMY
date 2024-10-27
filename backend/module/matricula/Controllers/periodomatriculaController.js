import conectarDB from '../../../config/db.js';

const pool = await conectarDB();

// Controlador para crear un periodo de matrícula
export const crearPeriodoMatricula = async (req, res) => {
    const { 
        fecha_inicio, 
        fecha_fin, 
        anio_academico, 
        estado 
    } = req.body;

    // Validar que las fechas no sean NULL
    if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({ Mensaje: 'Las fechas no pueden ser NULL' });
    }

    // Solo se permiten los estados "activo" o "inactivo"
    const estadosValidos = ['activo', 'inactivo'];
    if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ Mensaje: 'Estado inválido. Los estados permitidos son: ' + estadosValidos.join(', ') });
    }

    try {
        // Verificar si ya existe un periodo activo para el año académico
        const [existingPeriodos] = await pool.query('SELECT * FROM tbl_periodo_matricula WHERE anio_academico = ? AND estado = "activo"', [anio_academico]);

        // Permitir crear el nuevo periodo si no hay uno activo
        if (existingPeriodos.length > 0 && estado === 'activo') {
            return res.status(400).json({ Mensaje: 'Ya existe un periodo activo para el año académico ' + anio_academico });
        }

        // Llamada al procedimiento almacenado para insertar el periodo de matrícula
        await pool.query('CALL sp_insertar_periodo_matricula(?, ?, ?, ?)', [
            fecha_inicio, 
            fecha_fin, 
            anio_academico,  
            estado 
        ]);

        res.status(201).json({ Mensaje: 'Periodo de matrícula creado exitosamente' });
    } catch (error) {
        console.error('Error al crear el periodo de matrícula:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
// Obtener todos los periodos de matrícula o un periodo específico por Cod_periodo_matricula
export const obtenerPeriodoMatricula = async (req, res) => {
    const { Cod_periodo_matricula } = req.params; // Usamos params para obtener Cod_periodo_matricula

    try {
        let query;
        let params;

        if (Cod_periodo_matricula) {
            query = 'CALL sp_obtener_periodo_matricula(?)'; // Llama al procedimiento almacenado para un periodo específico
            params = [Cod_periodo_matricula];
        } else {
            query = 'CALL sp_obtener_periodo_matricula(NULL)'; // Llama al procedimiento almacenado para obtener todos los periodos
            params = [null];
        }

        const [results] = await pool.query(query, params);

        // Verificar si hay resultados
        if (!results || results[0].length === 0) {
            return res.status(404).json({ message: 'Periodo de matrícula no encontrado' });
        }

        // Formatear las fechas en los resultados
        const formattedResults = results[0].map(periodo => {
            return {
                ...periodo,
                Fecha_inicio: new Date(periodo.Fecha_inicio).toLocaleDateString('es-HN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                }),
                Fecha_fin: new Date(periodo.Fecha_fin).toLocaleDateString('es-HN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                }),
            };
        });

        res.status(200).json(formattedResults);
    } catch (error) {
        console.error('Error al obtener el periodo de matrícula:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
// Controlador para actualizar un periodo de matrícula
export const actualizarPeriodoMatricula = async (req, res) => {
    const { 
        p_cod_periodo_matricula, // ID del periodo a actualizar
        p_fecha_inicio, 
        p_fecha_fin, 
        p_anio_academico, 
        p_estado // Solo manejamos el estado del periodo (activo o inactivo)
    } = req.body;

    // Validar que el ID no sea NULL
    if (!p_cod_periodo_matricula) {
        return res.status(400).json({ Mensaje: 'El código del periodo de matrícula es obligatorio' });
    }

    // Validar que las fechas no sean NULL
    if (!p_fecha_inicio || !p_fecha_fin) {
        return res.status(400).json({ Mensaje: 'Las fechas no pueden ser NULL' });
    }

    // Solo se permiten los estados "activo" o "inactivo"
    const estadosValidos = ['activo', 'inactivo'];
    if (!estadosValidos.includes(p_estado)) {
        return res.status(400).json({ Mensaje: 'Estado inválido. Los estados permitidos son: ' + estadosValidos.join(', ') });
    }

    try {
        // Si se está actualizando a "activo", verificar si ya existe un periodo activo para el año académico
        if (p_estado === 'activo') {
            const [existingPeriodos] = await pool.query('SELECT * FROM tbl_periodo_matricula WHERE anio_academico = ? AND estado = "activo" AND cod_periodo_matricula != ?', [
                p_anio_academico,
                p_cod_periodo_matricula
            ]);

            if (existingPeriodos.length > 0) {
                return res.status(400).json({ Mensaje: 'No se puede activar el periodo. Ya existe un periodo activo para el año académico ' + p_anio_academico });
            }
        }

        // Llamada al procedimiento almacenado para actualizar el periodo de matrícula
        await pool.query('CALL sp_actualizar_periodo_matricula(?, ?, ?, ?, ?)', [
            p_cod_periodo_matricula,
            p_fecha_inicio,
            p_fecha_fin,
            p_anio_academico,
            p_estado
        ]);

        res.status(200).json({ Mensaje: 'Periodo de matrícula actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el periodo de matrícula:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
// Controlador para eliminar un periodo de matrícula
export const eliminarPeriodoMatricula = async (req, res) => {
    const { Cod_periodo_matricula } = req.params; // Usamos params para obtener Cod_periodo_matricula

    try {
        await pool.query('CALL sp_eliminar_periodo_matricula(?)', [
            Cod_periodo_matricula
        ]);

        res.status(200).json({ Mensaje: 'Periodo de matrícula eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el periodo de matrícula:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
