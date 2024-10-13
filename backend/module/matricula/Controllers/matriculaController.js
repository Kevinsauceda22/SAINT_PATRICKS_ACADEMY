import conectarDB from '../../../config/db.js';

const pool = await conectarDB();


// Controlador para crear una matrícula
export const crearMatricula = async (req, res) => {
    const {
        p_fecha_matricula,
        p_Cod_genealogia,
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

    const estadosValidos = ['pendiente', 'activa', 'cancelada', 'inactiva'];
    if (!estadosValidos.includes(p_tipo_estado)) {
        return res.status(400).json({ Mensaje: 'Estado inválido. Los estados permitidos son: ' + estadosValidos.join(', ') });
    }

    try {
        await pool.query('CALL insertar_matricula(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            p_fecha_matricula,
            p_Cod_genealogia,
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
        
        // Mostrar alerta de error
        Swal.fire({
            icon: 'error',
            title: 'Error al crear la matrícula',
            text: error.message,
            showConfirmButton: true,
        });

        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Obtener todas las matrículas o una matrícula por Cod_matricula
export const obtenerMatricula = async (req, res) => {
    const { Cod_matricula } = req.params; // Usamos params para obtener Cod_matricula

    try {
        let query;
        let params;

        if (Cod_matricula) {
            query = 'CALL sp_obtener_matriculas(?)'; // Llama al procedimiento almacenado para una matrícula específica
            params = [Cod_matricula];
        } else {
            query = 'CALL sp_obtener_matriculas(NULL)'; // Llama al procedimiento almacenado para obtener todas las matrículas
            params = [null];
        }

        const [results] = await pool.query(query, params);

        // Verificar si hay resultados
        if (!results || results[0].length === 0) {
            return res.status(404).json({ message: 'Matrícula no encontrada' });
        }

        // Formatear las fechas y horas en los resultados
        const formattedResults = results[0].map(matricula => {
            return {
                ...matricula,
                Fecha_inicio: new Date(matricula.Fecha_inicio).toLocaleDateString('es-HN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                }),
                Fecha_fin: new Date(matricula.Fecha_fin).toLocaleDateString('es-HN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                }),
                fecha_matricula: new Date(matricula.fecha_matricula).toLocaleDateString('es-HN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                }),
                
            };
        });

        return res.status(200).json(formattedResults); // Retornar las matrículas formateadas
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

export const eliminarMatricula = async (req, res) => {
    const { Cod_matricula } = req.params;

    try {
        const [rows] = await pool.query("CALL eliminar_matricula(?)", [Cod_matricula]);

        // Si rows.length es 0, significa que no se encontraron filas afectadas.
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


//pruebaaaa
// Controlador para crear un descuento y aplicarlo a la matrícula especificada
export const crearYAplicarDescuento = async (req, res) => {
    const { nombre_descuento, valor, fecha_inicio, fecha_fin, descripcion, cod_matricula } = req.body;

    try {
        // Paso 1: Obtener el cod_caja asociado a la matrícula
        const [matricula] = await pool.query('SELECT cod_caja FROM tbl_matricula WHERE cod_matricula = ?', [cod_matricula]);

        // Comprobar si la matrícula existe
        if (!matricula || matricula.length === 0) {
            return res.status(404).json({ Mensaje: 'Matrícula no encontrada' });
        }

        const cod_caja = matricula[0].cod_caja;

        // Paso 2: Llamar al procedimiento almacenado para crear y aplicar el descuento
        await pool.query('CALL crearYAplicarDescuento(?, ?, ?, ?, ?, ?)', [
            nombre_descuento,
            valor,
            fecha_inicio,
            fecha_fin,
            descripcion,
            cod_matricula // Pasando el cod_matricula al procedimiento
        ]);

        res.status(201).json({ Mensaje: 'Descuento creado y aplicado exitosamente' });
    } catch (error) {
        console.error('Error al crear y aplicar el descuento:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para actualizar un descuento y aplicarlo a la última caja
export const actualizarYAplicarDescuento = async (req, res) => {
    const { Cod_descuento, nombre_descuento, valor, fecha_inicio, fecha_fin, descripcion } = req.body;

    try {
        await pool.query('CALL actualizarYAplicarDescuento(?, ?, ?, ?, ?, ?)', [
            Cod_descuento,
            nombre_descuento,
            valor,
            fecha_inicio,
            fecha_fin,
            descripcion
        ]);

        res.status(200).json({ Mensaje: 'Descuento actualizado y aplicado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar y aplicar el descuento:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para obtener descuento por Cod_matricula (a través de Cod_caja)
export const obtenerDescuentoPorMatricula = async (req, res) => {
    const { Cod_matricula } = req.params;

    try {
        // Obtener Cod_caja vinculado a la matrícula
        const [cajaResults] = await pool.query('SELECT Cod_caja FROM caja WHERE Cod_matricula = ?', [Cod_matricula]);

        if (cajaResults.length === 0) {
            return res.status(404).json({ message: 'Caja no encontrada para esta matrícula' });
        }

        const Cod_caja = cajaResults[0].Cod_caja;

        // Obtener el descuento relacionado con el Cod_caja
        const [descuentoResults] = await pool.query('SELECT * FROM descuentos WHERE Cod_caja = ?', [Cod_caja]);

        if (descuentoResults.length === 0) {
            return res.status(404).json({ message: 'Descuento no encontrado para esta matrícula' });
        }

        res.status(200).json(descuentoResults[0]);
    } catch (error) {
        console.error('Error al obtener el descuento:', error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

