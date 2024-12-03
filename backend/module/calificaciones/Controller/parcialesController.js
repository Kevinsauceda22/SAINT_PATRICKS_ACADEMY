import conectarDB from '../../../config/db.js';
import jwt from 'jsonwebtoken';
const pool = await conectarDB();


// Obtener todos los parciales
export const obtenerParciales = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL get_all_parcial()');

        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron parciales' });
        }
    } catch (error) {
        console.error('Error al obtener la lista de parciales:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Crear un nuevo parcial
export const crearParcial = async (req, res) => {
    const { Nombre_parcial, Nota_recuperacion } = req.body;

    try {
        await pool.query('CALL insert_parcial(?, ?)', [
            Nombre_parcial,
            Nota_recuperacion
        ]);

        res.status(201).json({ Mensaje: 'Parcial agregado exitosamente' });
    } catch (error) {
        console.error('Error al agregar el parcial:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Actualizar un parcial
export const actualizarParcial = async (req, res) => {
    const { Cod_parcial, Nombre_parcial, Nota_recuperacion } = req.body;

   // console.log('Datos recibidos:', req.body); // Agregado para verificar datos

    try {
        await pool.query('CALL update_parcial(?, ?, ?)', [
            Cod_parcial,
            Nombre_parcial,
            Nota_recuperacion
        ]);

        res.status(200).json({ Mensaje: 'Parcial actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar el parcial:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

// Eliminar un parcial
export const eliminarParcial = async (req, res) => {  
    const { Cod_parcial } = req.body;  

    if (!Cod_parcial) {
        return res.status(400).json({ Mensaje: 'Cod_parcial es requerido' });
    }

    try {  
        await pool.query('CALL delete_parcial(?)', [Cod_parcial]);  
        res.status(200).json({ Mensaje: 'Parcial eliminada exitosamente' });  
    } catch (error) {  
        console.error('Error al eliminar el parcial:', error);  
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });  
    }  
};



//--------------------------------------------------------------------------- Parte Ariel----------------------------------------------------------------------------

export const obtenerParcialesPorFiltro = async (req, res) => {
    try {
        // Obtén el token desde los encabezados
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ mensaje: 'Token no proporcionado' });
        }

        // Decodifica el token para extraer `cod_persona`
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const codPersona = decodedToken.cod_persona;

        if (!codPersona) {
            return res.status(400).json({ mensaje: 'Token inválido o no contiene cod_persona' });
        }

        // Extrae los parámetros de la solicitud
        const { codSeccion, codAsignatura } = req.params;

        // Llama al procedimiento almacenado con los parámetros
        const [result] = await pool.query(
            'CALL obtener_parciales_por_filtro(?, ?, ?)',
            [codPersona, codSeccion, codAsignatura]
        );

        if (!result[0] || result[0].length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron parciales con los filtros proporcionados.' });
        }

        // Retorna los parciales encontrados
        res.status(200).json(result[0]);
    } catch (error) {
        console.error('Error al obtener los parciales:', error);
        res.status(500).json({ mensaje: 'Error al obtener los parciales', error: error.message });
    }
};




export const contarActividadesPorParciales = async (req, res) => {
    try {
        const { codProfesor, codAsignatura } = req.query;

        if (!codProfesor || !codAsignatura) {
            return res.status(400).json({ mensaje: 'Faltan parámetros requeridos.' });
        }

        const [result] = await pool.query(
            `SELECT 
                p.Cod_parcial,
                p.Nombre_parcial,
                (
                    SELECT COUNT(*)
                    FROM tbl_actividades_academicas aa
                    WHERE aa.Cod_parcial = p.Cod_parcial
                      AND aa.Cod_profesor = ?
                      AND aa.Cod_asignatura = ?
                ) AS total_actividades
             FROM tbl_parciales p`,
            [codProfesor, codAsignatura]
        );

        res.status(200).json(result);
    } catch (error) {
        console.error('Error al contar actividades:', error);
        res.status(500).json({ mensaje: 'Error al contar actividades por parcial.' });
    }
};


