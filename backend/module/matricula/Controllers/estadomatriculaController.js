import conectarDB from '../../../config/db.js';

const pool = await conectarDB();

// Controlador para crear un estado de matrícula
export const crearEstadoMatricula = async (req, res) => {
    const { p_tipo } = req.body; // Obtenemos el tipo desde el cuerpo de la solicitud

    // Solo se permiten los tipos válidos
    const tiposValidos = ['Activa', 'Cancelada', 'Pendiente', 'Inactiva'];
    if (!tiposValidos.includes(p_tipo)) {
        return res.status(400).json({ Mensaje: 'Tipo inválido. Los tipos permitidos son: ' + tiposValidos.join(', ') });
    }

    try {
        // Verificar si el tipo ya existe
        const [existingEstado] = await pool.query('SELECT * FROM tbl_estado_matricula WHERE Tipo = ?', [p_tipo]);
        if (existingEstado.length > 0) {
            return res.status(400).json({ Mensaje: 'El estado de matrícula ya existe' });
        }

        // Llamada al procedimiento almacenado para insertar el estado de matrícula
        await pool.query('CALL sp_insertar_estado_matricula(?)', [p_tipo]);

        res.status(201).json({ Mensaje: 'Estado de matrícula creado exitosamente' });
    } catch (error) {
        console.error('Error al crear el estado de matrícula:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para actualizar un estado de matrícula
export const actualizarEstado = async (req, res) => {
    const { p_cod_estado_matricula, p_tipo } = req.body; // Obtenemos el código y tipo desde el cuerpo de la solicitud

    // Solo se permiten los tipos válidos
    const tiposValidos = ['Activa', 'Cancelada', 'Pendiente', 'Inactiva'];
    if (!tiposValidos.includes(p_tipo)) {
        return res.status(400).json({ Mensaje: 'Tipo inválido. Los tipos permitidos son: ' + tiposValidos.join(', ') });
    }

    try {
        // Verificar si el tipo ya existe (si no es el mismo)
        const [existingEstado] = await pool.query('SELECT * FROM tbl_estado_matricula WHERE Tipo = ? AND Cod_estado_matricula != ?', [p_tipo, p_cod_estado_matricula]);
        if (existingEstado.length > 0) {
            return res.status(400).json({ Mensaje: 'El estado de matrícula ya existe' });
        }

        // Llamada al procedimiento almacenado para actualizar el estado de matrícula
        await pool.query('CALL sp_actualizar_estado_matricula(?, ?)', [
            p_cod_estado_matricula,
            p_tipo
        ]);

        res.status(200).json({ Mensaje: 'Estado de matrícula actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el estado de matrícula:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para eliminar un estado de matrícula
export const eliminarEstadoMatricula = async (req, res) => {
    const { p_cod_estado_matricula } = req.params; // Obtenemos el código del estado de matrícula desde los parámetros

    try {
        // Llamada al procedimiento almacenado para eliminar el estado de matrícula
        await pool.query('CALL sp_eliminar_estado_matricula(?)', [p_cod_estado_matricula]);

        res.status(200).json({ Mensaje: 'Estado de matrícula eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el estado de matrícula:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Obtener todos los estados de matrícula o un estado específico por Cod_estado_matricula
export const obtenerEstadoMatricula = async (req, res) => {
    const { cod_estado_matricula } = req.params; // Usamos params para obtener Cod_estado_matricula

    try {
        let query;
        let params;

        if (cod_estado_matricula) {
            query = 'CALL sp_obtener_estado_matricula(?)'; // Llama al procedimiento almacenado para un estado específico
            params = [cod_estado_matricula];
        } else {
            query = 'CALL sp_obtener_estado_matricula(NULL)'; // Llama al procedimiento almacenado para obtener todos los estados
            params = [null];
        }

        const [results] = await pool.query(query, params);

        // Verificar si hay resultados
        if (!results || results[0].length === 0) {
            return res.status(404).json({ message: 'Estado de matrícula no encontrado' });
        }

        // Formatear los resultados si es necesario (en este caso, no se requiere formateo adicional)
        const formattedResults = results[0].map(estado => {
            return {
                ...estado,
                Tipo: estado.Tipo, // Aquí puedes aplicar formateo si fuera necesario
            };
        });

        res.status(200).json(formattedResults);
    } catch (error) {
        console.error('Error al obtener el estado de matrícula:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
