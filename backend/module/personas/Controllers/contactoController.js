import conectarDB from '../../../config/db.js';

// Controlador para crear un contacto
export const crearContacto = async (req, res) => {
    const { cod_persona, cod_tipo_contacto, Valor } = req.body;
    const pool = await conectarDB();

    try {
        await pool.query('CALL P_Insert_Contacto(?, ?, ?)', [
            cod_persona,
            cod_tipo_contacto,
            Valor
        ]);
        res.status(201).json({ Mensaje: 'Contacto creado exitosamente', contacto: { cod_persona, cod_tipo_contacto, Valor } });
    } catch (error) {
        console.error('Error al crear el contacto:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para obtener contactos, opcionalmente por código de contacto o por código de persona
export const obtenerContacto = async (req, res) => {
    const { cod_contacto, cod_persona } = req.params;
    const pool = await conectarDB();

    try {
        let resultados;
        if (cod_contacto) {
            const [results] = await pool.query('CALL P_Get_Contacto_Por_Codigo(?)', [cod_contacto]);
            resultados = results[0];
        } else if (cod_persona) {
            const [results] = await pool.query('CALL P_Get_Contacto_Por_Persona(?)', [cod_persona]);
            resultados = results[0];
        } else {
            const [results] = await pool.query('CALL P_Get_Contacto()');
            resultados = results[0];
        }

        if (!resultados || resultados.length === 0) {
            return res.status(404).json({ Mensaje: 'No se encontraron contactos' });
        }

        res.status(200).json(resultados);
    } catch (error) {
        console.error('Error al obtener los contactos:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};



// Controlador para actualizar un contacto
export const actualizarContacto = async (req, res) => {
    const { cod_persona, cod_tipo_contacto, Valor } = req.body;
    const { cod_contacto } = req.params;
    const pool = await conectarDB();

    try {
        // Proceder con la actualización si el contacto existe
        await pool.query('CALL P_Put_Contacto(?, ?, ?, ?)', [
            cod_contacto,
            cod_persona,
            cod_tipo_contacto,
            Valor
        ]);

        res.status(200).json({
            Mensaje: 'Contacto actualizado exitosamente',
            cod_contacto: cod_contacto,
            cod_persona: cod_persona,
            cod_tipo_contacto: cod_tipo_contacto,
            Valor: Valor
        });
    } catch (error) {
        console.error('Error al actualizar el contacto:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Controlador para eliminar un contacto
export const eliminarContacto = async (req, res) => {
    const { cod_contacto } = req.params;
    const pool = await conectarDB();

    try {

        // Proceder con la eliminación si el contacto existe
        await pool.query('CALL P_Delete_Contacto(?)', [cod_contacto]);

        res.status(200).json({
            Mensaje: 'Contacto eliminado exitosamente',
            cod_contacto: cod_contacto
        });
    } catch (error) {
        console.error('Error al eliminar el contacto:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
