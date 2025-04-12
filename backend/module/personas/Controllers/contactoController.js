import conectarDB from '../../../config/db.js';
const pool = await conectarDB();

// Controlador para crear un contacto
// Controlador para obtener todos los contactos
export const obtenerTodosContactos = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL P_Get_Contactos()');

        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron contactos' });
        }
    } catch (error) {
        console.error('Error al obtener la lista de contactos:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para crear un contacto
export const crearContacto = async (req, res) => {
    const { cod_persona, cod_tipo_contacto, Valor, principal } = req.body;

    try {
        await pool.query('CALL P_Post_Contactos(?, ?, ?, ?)', [
            cod_persona,    
            cod_tipo_contacto,
            Valor,
            principal,
        ]);

        res.status(201).json({ mensaje: 'Contacto creado exitosamente' });
    } catch (error) {
        console.error('Error al crear contacto:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para actualizar un contacto
export const actualizarContacto = async (req, res) => {
    const { cod_contacto } = req.params;
    const { cod_persona, cod_tipo_contacto, Valor, principal } = req.body;

    try {
        await pool.query('CALL P_Put_Contactos(?, ?, ?, ?, ?)', [
            cod_contacto,
            cod_persona,
            cod_tipo_contacto,
            Valor,
            principal,
        ]);

        res.status(200).json({ mensaje: 'Contacto actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar contacto:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para actualizar el estado de un contacto
export const actualizarEstadoContacto = async (req, res) => {
    const { cod_contacto, estado } = req.body;

    // Validar parámetros
    if (!cod_contacto || estado === undefined) {
        return res.status(400).json({ mensaje: 'Faltan parámetros' });
    }

    try {
        // Llamar al procedimiento almacenado
        const [results] = await pool.query('CALL P_Put_EstadoContacto(?, ?)', [
            cod_contacto,
            estado,
        ]);

        // Obtener el mensaje devuelto por el procedimiento
        const mensaje = results[0][0].mensaje;

        console.log(`Estado actualizado para contacto ${cod_contacto}: ${estado}`); // Debug en consola
        res.json({ mensaje, cod_contacto, estado }); // Respuesta al frontend
    } catch (error) {
        console.error('Error al ejecutar el procedimiento almacenado:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

// Controlador para eliminar un contacto
export const eliminarContacto = async (req, res) => {
    const { cod_contacto } = req.params;

    if (!cod_contacto) {
        return res.status(400).json({ Mensaje: 'cod_contacto es requerido' });
    }

    try {
        await pool.query('CALL P_Delete_Contactos(?)', [cod_contacto]);
        res.status(200).json({ Mensaje: 'Contacto eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar contacto:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
