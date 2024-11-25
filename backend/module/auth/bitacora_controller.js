// src/controllers/bitacoraController.js
import conectarDB from '../../config/db.js';

const ACCIONES_VALIDAS = ['INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'];

const registrarBitacora = async (req, res) => {
    try {
        const pool = await conectarDB();
        
        const { cod_usuario, cod_objeto, accion, descripcion } = req.body;

        // Validar que la acción sea una de las permitidas
        if (!ACCIONES_VALIDAS.includes(accion)) {
            return res.status(400).json({
                success: false,
                message: `Acción no válida. Debe ser una de: ${ACCIONES_VALIDAS.join(', ')}`
            });
        }
    
        const [result] = await pool.query(
            'CALL sp_InsertarBitacora(?, ?, ?, ?)',
            [cod_usuario, cod_objeto, accion, descripcion]
        );
        
        res.json({
            success: true,
            message: 'Registro en bitácora exitoso'
        });
    } catch (error) {
        console.error('Error al registrar en bitácora:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar en bitácora',
            error: error.message
        });
    }
};

// controllers/bitacoraController.js
const obtenerReporte = async (req, res) => {
    try {
        const pool = await conectarDB();
        
        const [actividades] = await pool.query(
            `SELECT 
                b.*,
                u.Nombre_usuario as NombreUsuario,
                o.Nom_objeto as NombreObjeto
             FROM tbl_bitacora b
             LEFT JOIN tbl_usuarios u ON b.Cod_usuario = u.cod_usuario
             LEFT JOIN tbl_objetos o ON b.Cod_objeto = o.Cod_Objeto
             ORDER BY b.Fecha DESC`
        );
        
        res.json(actividades);
    } catch (error) {
        console.error('Error al obtener reporte de actividades:', error);
        res.status(500).json({
            msg: 'Error al obtener reporte de actividades',
            error: error.message
        });
    }
};
const obtenerObjetos = async (req, res) => {
    try {
        const pool = await conectarDB();
        
        const [objetos] = await pool.query('SELECT * FROM tbl_objetos');
        
        res.json(objetos);
    } catch (error) {
        console.error('Error al obtener objetos:', error);
        res.status(500).json({
            msg: 'Error al obtener objetos',
            error: error.message
        });
    }
};

export {
    registrarBitacora,
    obtenerReporte,
    obtenerObjetos
};