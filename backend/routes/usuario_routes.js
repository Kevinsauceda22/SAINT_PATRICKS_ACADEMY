// routes/usuarios.js
import express from 'express';
import pool from '../config/db.js';
import conectarDB from '../config/db.js';
 
const router = express.Router();

// Crear un nuevo usuario
router.post('/', async (req, res) => {
    const { nombre_usuario, correo_usuario, contraseña_usuario, rol_usuario, confirmacion_email, token_usuario } = req.body;

    const connection = await pool.getConnection();

    try {
        const [nuevoUsuario] = await connection.query('CALL crearUsuario(?, ?, ?, ?, ?, ?)', [nombre_usuario, correo_usuario, contraseña_usuario, rol_usuario, confirmacion_email, token_usuario]);
        res.status(201).json(nuevoUsuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al crear el usuario' });
    } finally {
        connection.release();
    }
});
// Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const [usuarios] = await pool.query('CALL sp_obtener_usuarios()');
        res.status(200).json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener los usuarios' });
    }
});

// Obtener un usuario por su cod_usuario
router.get('/:cod_usuario', async (req, res) => {
    try {
        const [usuario] = await pool.query('CALL sp_obtener_usuario(?)', [req.params.cod_usuario]);
        if (usuario.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        res.status(200).json(usuario[0]); // Asumiendo que el resultado es un array
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener el usuario' });
    }
});

// Actualizar un usuario
router.put('/:cod_usuario', async (req, res) => {
    const { nombre_usuario, correo_usuario, contraseña_usuario, rol_usuario, confirmacion_email, token_usuario } = req.body;
    try {
        const [result] = await pool.query('CALL sp_actualizar_usuario(?, ?, ?, ?, ?, ?, ?)', [
            req.params.cod_usuario,
            nombre_usuario,
            correo_usuario,
            contraseña_usuario,
            rol_usuario,
            confirmacion_email,
            token_usuario
        ]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        res.status(200).json({ mensaje: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al actualizar el usuario' });
    }
});

// Eliminar un usuario
router.delete('/:cod_usuario', async (req, res) => {
    try {
        const [result] = await pool.query('CALL sp_eliminar_usuario(?)', [req.params.cod_usuario]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }
        res.status(204).json(); // No content
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar el usuario' });
    }
});

export default router;
