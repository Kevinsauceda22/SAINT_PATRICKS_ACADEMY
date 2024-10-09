import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


//Controlador para obtener uno o todos los edificios
export const obtenerEdificios = async (req, res) => {
    const { Nombre_edificio } = req.params; // Extraemos el parámetro de la URL

    try {
        // Si el valor es vacío o 'null', lo pasamos como null explícitamente al procedimiento almacenado
        const query = 'CALL sp_get_Edificios(?)';
        const [results] = await pool.query(query, [
            Nombre_edificio && Nombre_edificio !== 'null' ? Nombre_edificio : null
        ]);

        // Verificar si se encontraron registros
        if (results[0].length === 0) {
            return res.status(404).json({ message: 'Edificio no encontrado' });
        }

        return res.status(200).json(results[0]); // Asegúrate de acceder al primer elemento del array
    } catch (error) {
        console.error('Error al obtener el edificio:', error);
        res.status(500).json({ message: 'Error al obtener el edificio', error });
    }
};


//Controlador para crear un edificio
export const crearEdificio = async (req, res) => {
    const {
        p_Nombre_edificio,
        p_Numero_pisos,
        p_Aulas_disponibles
    } = req.body;

    try {
        // Llamada al procedimiento almacenado para insertar el edificio
        await pool.query('CALL sp_insert_Edificio(?, ?, ?)', [
            p_Nombre_edificio,
            p_Numero_pisos,
            p_Aulas_disponibles
        ]);

        res.status(201).json({ Mensaje: 'Edificio creado exitosamente' });
    } catch (error) {
        if (error.code === '45000') {
            // Si el error es lanzado por la señal en el procedimiento
            return res.status(400).json({ Mensaje: 'Error: Ya existe un edificio con ese nombre.' });
        }

        console.error('Error al crear el edificio:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};


//Controlador para actualizar el edificio
export const actualizarEdificio = async (req, res) => {
    const {
        p_Item,  // Cod_edificio, ahora llamado 'Item'
        p_Nuevo_nombre_edificio,
        p_Numero_pisos,
        p_Aulas_disponibles
    } = req.body;

    try {
        // Llamada al procedimiento almacenado para actualizar el edificio
        await pool.query('CALL sp_update_Edificio(?, ?, ?, ?)', [
            p_Item,
            p_Nuevo_nombre_edificio,
            p_Numero_pisos,
            p_Aulas_disponibles
        ]);

        res.status(200).json({ Mensaje: 'Edificio actualizado exitosamente' });
    } catch (error) {
        if (error.code === '45000') {
            // Si el error es lanzado por la señal en el procedimiento
            return res.status(400).json({ Mensaje: error.sqlMessage });
        }

        console.error('Error al actualizar el edificio:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};


//Controlador para eliminar un edificio
export const eliminarEdificio = async (req, res) => {
    const { p_Nombre_edificio } = req.params;

    try {
        // Llamada al procedimiento almacenado para eliminar el edificio
        const [rows] = await pool.query("CALL sp_delete_Edificio(?)", [p_Nombre_edificio]);

        if (rows.affectedRows > 0) {
            return res.status(200).json({ message: 'Edificio eliminado correctamente.' });
        } else {
            return res.status(404).json({ message: 'No se encontró el edificio especificado.' });
        }
    } catch (error) {
        if (error.code === '45000') {
            // Si el error es lanzado por la señal en el procedimiento
            return res.status(400).json({ message: 'Error: El nombre del edificio no existe.' });
        }

        console.error('Error al eliminar el edificio:', error);
        return res.status(500).json({ message: 'Ocurrió un error al intentar eliminar el edificio.', error });
    }
};