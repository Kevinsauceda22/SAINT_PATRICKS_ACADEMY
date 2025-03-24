import conectarDB from '../../../config/db.js';

const pool = await conectarDB();

// Controlador para crear un departamento
export const crearDepartamento = async (req, res) => {
    const { Nombre_departamento, Nombre_municipio } = req.body;

    // Validar que el nombre del departamento no sea NULL
    if (!Nombre_departamento) {
        return res.status(400).json({ Mensaje: 'El nombre del departamento no puede ser NULL' });
    }

    try {
        // Llamada al procedimiento almacenado para insertar un departamento
        await pool.query('CALL sp_insert_departamento(?, ?)', [
            Nombre_departamento,
            Nombre_municipio
        ]);

        res.status(201).json({ Mensaje: 'Departamento creado exitosamente' });
    } catch (error) {
        console.error('Error al crear el departamento:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Obtener todos los departamentos o uno específico por Cod_departamento
export const obtenerDepartamento = async (req, res) => {
    const { Cod_departamento } = req.params;

    try {
        let query;
        let params;

        if (Cod_departamento) {
            query = 'CALL sp_get_departamento(?)'; // Para obtener un departamento específico
            params = [Cod_departamento];
        } else {
            query = 'CALL sp_get_departamento(NULL)'; // Para obtener todos los departamentos
            params = [null];
        }

        const [results] = await pool.query(query, params);

        // Verificar si hay resultados
        if (!results || results[0].length === 0) {
            return res.status(404).json({ Mensaje: 'Departamento no encontrado' });
        }

        res.status(200).json(results[0]);
    } catch (error) {
        console.error('Error al obtener el departamento:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para actualizar un departamento
export const actualizarDepartamento = async (req, res) => {
    const { Cod_departamento } = req.params;
    const { Nombre_departamento, Nombre_municipio } = req.body;

    // Verificar que el código del departamento sea válido
    if (!Cod_departamento) {
        return res.status(400).json({ Mensaje: 'El código del departamento es requerido.' });
    }

    try {
        // Llamada al procedimiento almacenado para actualizar el departamento
        await pool.query('CALL sp_update_departamento(?, ?, ?)', [
            Cod_departamento,
            Nombre_departamento,
            Nombre_municipio
        ]);

        res.status(200).json({ Mensaje: 'Departamento actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el departamento:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para eliminar un departamento
export const eliminarDepartamento = async (req, res) => {
    const { Cod_departamento } = req.params;

    // Verificar que el código del departamento sea válido
    if (!Cod_departamento) {
        return res.status(400).json({ Mensaje: 'El código del departamento es requerido.' });
    }

    try {
        // Llamada al procedimiento almacenado para eliminar el departamento
        await pool.query('CALL sp_delete_departamento(?)', [
            Cod_departamento
        ]);

        res.status(200).json({ Mensaje: 'Departamento eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el departamento:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
