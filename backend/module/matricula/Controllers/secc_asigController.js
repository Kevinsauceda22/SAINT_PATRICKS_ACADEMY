import conectarDB from '../../../config/db.js';
import jwt from 'jsonwebtoken';
const pool = await conectarDB();




export const obtenerSeccionesAsignaturasPorSeccion = async (req, res) => {
    try {
        const { cod_secciones } = req.params; // Obtener el parámetro desde la URL
        if (!cod_secciones) {
            return res.status(400).json({ Mensaje: 'Se requiere el parámetro cod_secciones' });
        }

        const [rows] = await pool.query('CALL G_Get_SeccionesAsignaturas(?)', [cod_secciones]);

        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron datos para la sección seleccionada' });
        }
    } catch (error) {
        console.error('Error al obtener la lista de secciones y asignaturas:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};


export const obtenerTodasSecciones = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL G_Get_Secciones()');
        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron secciones' });
        }
    } catch (error) {
        console.error('Error al obtener la lista de secciones:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

export const obtenerTodosGrados = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL G_Get_Grados()');
        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron grados' });
        }
    } catch (error) {
        console.error('Error al obtener la lista de grados:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};


export const obtenerTodasAsignaturas = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL get_all_asignaturas()');
        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron asignaturas' });
        }
    } catch (error) {
        console.error('Error al obtener la lista de asignaturas:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};


export const crearSeccionAsignatura = async (req, res) => {
    const {
        horario_inicio,
        horario_fin,
        cod_secciones,
        lunes,
        martes,
        miercoles,
        jueves,
        viernes,
        sabado,
        domingo
    } = req.body;

    try {
        await pool.query('CALL G_Post_SeccionAsignatura(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            horario_inicio,
            horario_fin,
            cod_secciones,
            lunes,
            martes,
            miercoles,
            jueves,
            viernes,
            sabado,
            domingo
        ]);

        res.status(201).json({ mensaje: 'Sección y asignatura creada exitosamente' });
    } catch (error) {
        console.error('Error al crear la sección y asignatura:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};

export const actualizarSeccionAsignatura = async (req, res) => {
    const { Cod_seccion_asignatura } = req.params;

    const {
        horario_inicio,
        horario_fin,
        cod_secciones,
        lunes,
        martes,
        miercoles,
        jueves,
        viernes,
        sabado,
        domingo
    } = req.body;

    try {
        await pool.query('CALL G_Put_SeccionAsignatura(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            Cod_seccion_asignatura,
            horario_inicio,
            horario_fin,
            cod_secciones,
            lunes,
            martes,
            miercoles,
            jueves,
            viernes,
            sabado,
            domingo
        ]);

        res.status(200).json({ mensaje: 'Sección y asignatura actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar la sección y asignatura:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};


export const eliminarSeccionAsignatura = async (req, res) => {
    const { Cod_seccion_asignatura } = req.params;

    if (!Cod_seccion_asignatura) {
        return res.status(400).json({ Mensaje: 'Cod_seccion_asignatura es requerido' });
    }

    try {
        await pool.query('CALL G_Delete_SeccionAsignatura(?)', [Cod_seccion_asignatura]);
        res.status(200).json({ Mensaje: 'Sección y asignatura eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar la sección y asignatura:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message, stack: error.stack });
    }
};
