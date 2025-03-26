import conectarDB from '../../../config/db.js';

const pool = await conectarDB();

// Controlador para obtener todos los departamentos
export const obtenerTodoDepartamento = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL P_Get_Departamentos()');

        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ mensaje: 'No se encontraron departamentos' });
        }
    } catch (error) {
        console.error('Error al obtener la lista de departamentos:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};


// Controlador para crear un departamento
export const crearDepartamento = async (req, res) => {
    const { nombre_departamento, estado } = req.body;

    try {
        await pool.query('CALL P_Post_Departamentos(?, ?)', [nombre_departamento, estado]);

        res.status(201).json({ mensaje: 'Departamento creado exitosamente' });
    } catch (error) {
        console.error('Error al crear el departamento:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};


// Controlador para actualizar un departamento
export const actualizarDepartamento = async (req, res) => {
    const { Cod_departamento } = req.params;
    const { nombre_departamento, estado } = req.body;

    try {
        await pool.query('CALL P_Put_Departamentos(?, ?, ?)', [
            Cod_departamento,
            nombre_departamento,
            estado
        ]);

        res.status(200).json({ mensaje: 'Departamento actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el departamento:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para actualizar el estado de un departamento
export const actualizarEstadoDepartamento = async (req, res) => {
    const { cod_departamento, estado } = req.body;

    // Validar parámetros
    if (!cod_departamento || estado === undefined) {
        return res.status(400).json({ mensaje: 'Faltan parámetros' });
    }

    try {
        // Llamar al procedimiento almacenado
        const [results] = await pool.query('CALL P_Put_EstadoDepartamento(?, ?)', [cod_departamento, estado]);

        // Obtener el mensaje devuelto por el procedimiento
        const mensaje = results[0][0].mensaje;

        console.log(`Estado actualizado para departamento ${cod_departamento}: ${estado}`); // Debug en consola
        res.json({ mensaje, cod_departamento, estado }); // Respuesta al frontend
    } catch (error) {
        console.error('Error al ejecutar el procedimiento almacenado:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};



// Controlador para eliminar un departamento
export const eliminarDepartamento = async (req, res) => {
    const { Cod_departamento } = req.params;

    if (!Cod_departamento) {
        return res.status(400).json({ mensaje: 'Cod_departamento es requerido' });
    }

    try {
        await pool.query('CALL P_Delete_Departamentos(?)', [Cod_departamento]);
        res.status(200).json({ mensaje: 'Departamento eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el departamento:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

