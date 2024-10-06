import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


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
        p_Cod_concepto,
        p_Codificacion_matricula
    } = req.body;

    try {
        await pool.query('CALL insertar_matricula(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
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
            p_Cod_concepto,
            p_Codificacion_matricula
        ]);

        res.status(201).json({ Mensaje: 'Matrícula creada exitosamente' });
    } catch (error) {
        console.error('Error al crear la matrícula:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Obtener todas las matrículas o una matrícula por Cod_matricula
export const obtenerMatricula = async (req, res) => {
    const { Cod_matricula } = req.params;

    try {
        let query;
        let params;

        if (Cod_matricula) {
            query = 'CALL sp_obtener_matriculas(?)';
            params = [Cod_matricula];
        } else {
            query = 'CALL sp_obtener_matriculas(NULL)';
            params = [null];
        }

        const [results] = await pool.query(query, params);

        // Verificar si hay resultados
        if (!results || results[0].length === 0) {
            return res.status(404).json({ message: 'Matrícula no encontrada' });
        }

        return res.status(200).json(results[0]); // Retornar las matrículas obtenidas
    } catch (error) {
        console.error('Error al obtener la matrícula:', error);
        res.status(500).json({ message: 'Error al obtener la matrícula', error: error.message });
    }
};


// Obtener todas las cajas o una caja por Cod_caja
export const obtenerCaja = async (req, res) => {
    const { Cod_caja } = req.params;

    try {
        if (Cod_caja) {
            const query = 'CALL sp_obtener_caja(?)';
            const [results] = await pool.query(query, [Cod_caja]);

            if (results[0].length === 0) {
                return res.status(404).json({ message: 'Caja no encontrada' });
            }

            return res.status(200).json(results[0]);
        } else {
            const query = 'CALL sp_obtener_caja(NULL)';
            const [results] = await pool.query(query, [null]);

            return res.status(200).json(results[0]);
        }
    } catch (error) {
        console.error('Error al obtener la caja:', error);
        res.status(500).json({ message: 'Error al obtener la caja', error });
    }
};

// Controlador para actualizar una matrícula
export const actualizarMatricula = async (req, res) => {
    const {
        Cod_matricula,
        fecha_matricula,
        Cod_persona,
        tipo_estado,
        Fecha_inicio,
        Fecha_fin,
        anio_academico,
        tipo_matricula,
        p_Codificacion_matricula,
        Tipo_transaccion,
        Monto,
        Descripcion_caja,
        Cod_concepto
    } = req.body;

    try {
        await pool.query('CALL actualizar_matricula(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            Cod_matricula,
            fecha_matricula,
            Cod_persona,
            tipo_estado,
            Fecha_inicio,
            Fecha_fin,
            anio_academico,
            tipo_matricula,
            p_Codificacion_matricula,
            Tipo_transaccion,
            Monto,
            Descripcion_caja,
            Cod_concepto
        ]);

        res.status(200).json({ Mensaje: 'Matrícula actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar la matrícula:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para aplicar descuento automático
export const aplicarDescuentoAutomatico = async (req, res) => {
    try {
        await pool.query('CALL aplicar_descuento_automatico()');
        res.status(200).json({ mensaje: 'Descuento aplicado automáticamente.' });
    } catch (error) {
        console.error('Error al aplicar el descuento automático:', error);
        res.status(500).json({ mensaje: 'Error al aplicar el descuento', error: error.message });
    }
};

// Controlador para crear un descuento
export const crearDescuento = async (req, res) => {
    const { nombre_descuento, valor, fecha_inicio, fecha_fin, descripcion } = req.body;

    try {
        await pool.query('CALL insertar_descuento(?, ?, ?, ?, ?)', [
            nombre_descuento,
            valor,
            fecha_inicio,
            fecha_fin,
            descripcion
        ]);

        res.status(201).json({ Mensaje: 'Descuento creado exitosamente' });
    } catch (error) {
        console.error('Error al crear el descuento:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para obtener descuentos
export const obtenerDescuentos = async (req, res) => {
    const { id } = req.params;

    try {
        const [results] = await pool.query('CALL obtener_descuentos(?)', [id ? id : null]);

        if (results[0].length === 0) {
            return res.status(404).json({ message: 'Descuento no encontrado' });
        }

        res.status(200).json(results[0]);
    } catch (error) {
        console.error('Error al obtener descuentos:', error);
        res.status(500).json({ message: 'Error al obtener descuentos', error });
    }
};

// Controlador para actualizar un descuento
export const actualizarDescuento = async (req, res) => {
    const { Cod_descuento, nombre_descuento, valor, fecha_inicio, fecha_fin, descripcion } = req.body;

    try {
        const [result] = await pool.query('CALL actualizar_descuento(?, ?, ?, ?, ?, ?)', [
            Cod_descuento,
            nombre_descuento,
            valor,
            fecha_inicio,
            fecha_fin,
            descripcion
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Descuento no encontrado o no se realizaron cambios.' });
        }

        res.status(200).json({ message: 'Descuento actualizado correctamente' });
    } catch (error) {
        console.error('Error al actualizar el descuento:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

// Controlador para actualizar el descuento automático
export const actualizarDescuentoAutomatico = async (req, res) => {
    try {
        await pool.query('CALL actualizar_descuento_automatico()');
        res.status(200).json({ Mensaje: 'Descuento automático actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el descuento automático:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para eliminar una matrícula
export const eliminarMatricula = async (req, res) => {
    const { Cod_matricula } = req.params;

    try {
        const [rows] = await pool.query("CALL eliminar_matricula(?)", [Cod_matricula]);

        if (rows.affectedRows > 0) {
            return res.status(200).json({ message: 'Matrícula eliminada correctamente.' });
        } else {
            return res.status(404).json({ message: 'No se encontró la matrícula especificada.' });
        }
    } catch (error) {
        console.error('Error al eliminar la matrícula:', error);
        return res.status(500).json({ message: 'Ocurrió un error al intentar eliminar la matrícula.', error });
    }
};
