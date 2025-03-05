import express from 'express';
import { pool } from '../../config/db.js';
import checkAuth from '../../middleware/Auth_middleware.js';

const router = express.Router();

// Route to get additional person data
router.get('/additional/:cod_persona', checkAuth, async (req, res) => {
    try {
        const [result] = await pool.query(`
            SELECT 
                p.*,
                g.descripcion as genero_descripcion,
                n.descripcion as nacionalidad,
                d.nombre_departamento,
                m.nombre_municipio
            FROM tbl_personas p
            LEFT JOIN tbl_genero g ON p.cod_genero = g.cod_genero
            LEFT JOIN tbl_nacionalidades n ON p.cod_nacionalidad = n.cod_nacionalidad
            LEFT JOIN tbl_departamentos d ON p.cod_departamento = d.cod_departamento
            LEFT JOIN tbl_municipios m ON p.cod_municipio = m.cod_municipio
            WHERE p.cod_persona = ?
        `, [req.params.cod_persona]);

        if (result.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Persona no encontrada' 
            });
        }

        res.json(result[0]);
    } catch (error) {
        console.error('Error fetching person data:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al obtener datos de la persona',
            error: error.message 
        });
    }
});

export default router;