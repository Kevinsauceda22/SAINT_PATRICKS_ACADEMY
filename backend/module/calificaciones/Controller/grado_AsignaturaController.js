import conectarDB from '../../../config/db.js';
const pool = await conectarDB();


//apis para obtener los grados y sus asignaturas
// controllers/gradosAsignaturasController.js

export const obtenerGradosAsignaturas = async (req, res) => {
    const { Cod_grado } = req.params; // Obtener el código del grado desde los parámetros de la URL

    if (!Cod_grado) {
        return res.status(400).json({ Mensaje: 'El código de grado es obligatorio.' });
    }

    try {
        const [rows] = await pool.query('CALL get_all_grados_asignaturas(?)', [Cod_grado]);

        if (rows[0].length > 0) {
            res.status(200).json(rows[0]); // Responder con los datos obtenidos
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron datos' });
        }
    } catch (error) {
        console.error('Error al obtener las asignaturas:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};



export const crearGradoAsignatura = async (req, res) => {
    const { Cod_grado, Cod_asignatura } = req.body;

    try {
        await pool.query('CALL insert_grados_Asignaturas(?, ?)', [Cod_grado, Cod_asignatura]);
        res.status(201).json({ Mensaje: 'Asignatura asignada exitosamente' });
    } catch (error) {
        console.error('Error al asignar una asignatura dentro del grado:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};


// export const actualizarGradoAsignatura = async (req, res) => {
//     const { Cod_grados_asignaturas, Cod_grado, Cod_asignatura } = req.body;

//     try {
//         await pool.query('CALL update_grados_asignaturas(?, ?, ?)', [Cod_grados_asignaturas, Cod_grado, Cod_asignatura]);
//         res.status(200).json({ Mensaje: 'Asignatura actualizada exitosamente' });
//     } catch (error) {
//         console.error('Error al actualizar la asignatura:', error);
//         res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
//     }
// };

export const actualizarGradoAsignatura = async (req, res) => {
    const { Cod_grados_asignaturas, Cod_grado, Cod_asignatura } = req.body;

    console.log(`Cod_grados_asignaturas: ${Cod_grados_asignaturas}, Cod_grado: ${Cod_grado}, Cod_asignatura: ${Cod_asignatura}`);

    try {
        await pool.query('CALL update_grados_asignaturas(?, ?, ?)', [Cod_grados_asignaturas, Cod_grado, Cod_asignatura]);
        res.status(200).json({ Mensaje: 'Asignatura actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar la asignatura:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};


// export const eliminarGradoAsignatura = async (req, res) => {
//     const { Cod_grados_asignaturas_input } = req.params;

//     try {
//         await pool.query('CALL delete_grado_asignaturas(?)', [Cod_grados_asignaturas_input]);
//         res.status(200).json({ Mensaje: 'Grado y asignatura eliminados exitosamente' });
//     } catch (error) {
//         console.error('Error al eliminar grado y asignatura:', error);
//         res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
//     }
// };

// Eliminar una asignatura
export const eliminarGradoAsignaturas = async (req, res) => {  
    const { Cod_grados_asignaturas } = req.body;  

    if (!Cod_grados_asignaturas) {
        return res.status(400).json({ Mensaje: 'Cod_grados_asignaturas es requerido' });
    }
    try {  
        await pool.query('CALL delete_grado_asignaturas(?)', [Cod_grados_asignaturas]);  
        res.status(200).json({ Mensaje: 'Asignatura eliminada exitosamente' });  
    } catch (error) {  
        console.error('Error al eliminar la asignatura', error);  
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });  
    }  
};
