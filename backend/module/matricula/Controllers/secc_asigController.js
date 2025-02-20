import conectarDB from '../../../config/db.js';
import jwt from 'jsonwebtoken';
const pool = await conectarDB();

export const obtenerTodasSeccionesAsignaturas = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL G_Get_SeccionesAsignaturas()');
        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron las secciones y asignaturas' });
        }
    } catch (error) {
        console.error('Error al obtener la lista de secciones y asignaturas:', error);
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};

export const obtenerDias = async (req, res) => {
    try {
        const [rows] = await pool.query('CALL G_Get_dias()');
        if (rows[0].length > 0) {
            res.status(200).json(rows[0]);
        } else {
            res.status(404).json({ Mensaje: 'No se encontraron los días' });
        }
    } catch (error) {
        console.error('Error al obtener la lista de días:', error);
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
        cod_grado,
        lunes,
        martes,
        miercoles,
        jueves,
        viernes,
        sabado,
        domingo
    } = req.body;

    try {
        await pool.query('CALL G_Post_SeccionAsignatura(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            horario_inicio,
            horario_fin,
            cod_secciones,
            cod_grado,
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
        cod_grado,
        lunes,
        martes,
        miercoles,
        jueves,
        viernes,
        sabado,
        domingo
    } = req.body;

    try {
        await pool.query('CALL G_Put_SeccionAsignatura(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            Cod_seccion_asignatura,
            horario_inicio,
            horario_fin,
            cod_secciones,
            cod_grado,
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
        res.status(500).json({ Mensaje: 'Error en el servidor', error: error.message });
    }
};
