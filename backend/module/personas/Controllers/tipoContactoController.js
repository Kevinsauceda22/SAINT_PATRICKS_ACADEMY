import conectarDB from '../../../config/db.js'; 

// Controlador de crearTipoContacto
export const crearTipoContacto = async (req, res) => {
    const { tipo_contacto } = req.body;

    if (!tipo_contacto || tipo_contacto.trim() === '') {
        return res.status(400).json({ 
            Mensaje: 'El campo tipo_contacto es obligatorio y no puede estar vacío' 
        });
    }

    const pool = await conectarDB();

    try {
        const [rows] = await pool.query('CALL P_Insert_Tipo_Contacto(?)', [tipo_contacto]);
        const result = rows && rows[0] && rows[0][0];
        
        res.status(201).json({ 
            Mensaje: 'Tipo de contacto creado exitosamente',
            cod_tipo_contacto: result?.cod_tipo_contacto || result?.insertId,
            tipo_contacto: tipo_contacto  // Asegúrate de devolver tipo_contacto aquí
        });
    } catch (error) {
        console.error('Error al crear el tipo de contacto:', error);
        res.status(500).json({ 
            Mensaje: 'Error en el servidor', 
            error: error.message 
        });
    }
};

// Controlador de actualizarTipoContacto
export const actualizarTipoContacto = async (req, res) => {
    const { tipo_contacto } = req.body;
    const { cod_tipo_contacto } = req.params;

    if (!tipo_contacto || tipo_contacto.trim() === '') {
        return res.status(400).json({ 
            Mensaje: 'El campo tipo_contacto es obligatorio y no puede estar vacío' 
        });
    }

    const pool = await conectarDB();

    try {
        const [[existingRecord]] = await pool.query('CALL P_Get_Tipo_Contacto_Por_Codigo(?)', [cod_tipo_contacto]);

        if (!existingRecord) {
            return res.status(404).json({ 
                Mensaje: 'Tipo de contacto no encontrado' 
            });
        }

        await pool.query('CALL P_Update_Tipo_Contacto(?, ?)', [tipo_contacto, cod_tipo_contacto]);

        res.status(200).json({ 
            Mensaje: 'Tipo de contacto actualizado exitosamente',
            cod_tipo_contacto: cod_tipo_contacto,
            tipo_contacto: tipo_contacto  // Asegúrate de devolver tipo_contacto aquí
        });
    } catch (error) {
        console.error('Error al actualizar el tipo de contacto:', error);
        res.status(500).json({ 
            Mensaje: 'Error en el servidor', 
            error: error.message 
        });
    }
};


// Controlador para obtener uno o todos los tipos de contacto
export const obtenerTipoContacto = async (req, res) => {
    const { cod_tipo_contacto } = req.params; // Extrae el parámetro del request si existe
    const pool = await conectarDB();

    try {
        const [results] = await pool.query('CALL P_Get_Tipo_Contacto()');
        let tiposContacto = results[0];

        // Filtrar para eliminar registros con `undefined` o vacíos en tipo_contacto
        tiposContacto = tiposContacto.filter(item => item.tipo_contacto && item.tipo_contacto.trim() !== '');

        // Si se proporciona un cod_tipo_contacto, filtramos los resultados
        if (cod_tipo_contacto) {
            const tipoContacto = tiposContacto.find(item => item.cod_tipo_contacto === parseInt(cod_tipo_contacto));
            
            if (!tipoContacto) {
                return res.status(404).json({ 
                    Mensaje: 'Tipo de contacto no encontrado',
                    data: []
                });
            }
            return res.status(200).json(tipoContacto); // Devuelve el tipo de contacto específico si se encuentra
        }

        // Si no se especifica cod_tipo_contacto, devuelve todos los tipos de contacto
        res.status(200).json(tiposContacto);
    } catch (error) {
        console.error('Error al obtener los tipos de contacto:', error);
        res.status(500).json({ 
            Mensaje: 'Error en el servidor', 
            error: error.message 
        });
    }
};


// Controlador para eliminar un tipo de contacto
export const eliminarTipoContacto = async (req, res) => {
    const { cod_tipo_contacto } = req.params;
    const pool = await conectarDB();

    try {
        const [[result]] = await pool.query('CALL P_Get_Tipo_Contacto_Por_Codigo(?)', [cod_tipo_contacto]);

        if (!result) {
            return res.status(404).json({ 
                Mensaje: 'Tipo de contacto no encontrado' 
            });
        }

        await pool.query('CALL P_Delete_Tipo_Contacto(?)', [cod_tipo_contacto]);

        res.status(200).json({ 
            Mensaje: 'Tipo de contacto eliminado exitosamente',
            cod_tipo_contacto: cod_tipo_contacto
        });
    } catch (error) {
        console.error('Error al eliminar el tipo de contacto:', error);
        res.status(500).json({ 
            Mensaje: 'Error en el servidor', 
            error: error.message 
        });
    }
};
