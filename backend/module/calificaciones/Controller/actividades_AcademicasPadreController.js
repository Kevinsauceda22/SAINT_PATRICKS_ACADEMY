import conectarDB from '../../../config/db.js';
import jwt from 'jsonwebtoken';

const pool = await conectarDB();

// Controlador para obtener calificaciones y estado de pagos
export const obtenerActividades = async (req, res) => {
    try {
        // Obtener el token del encabezado
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ mensaje: 'Token no proporcionado' });
        }

        // Verificar y decodificar el token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const codPersona = decodedToken.cod_persona;

        if (!codPersona) {
            return res.status(400).json({ mensaje: 'El token no contiene cod_persona' });
        }

        // Llamar al procedimiento almacenado para obtener las calificaciones
        const [calificacionesResult] = await pool.query('CALL ObtenerActividadesPorPadre(?)', [codPersona]);

        // Verificar si hay resultados para las calificaciones
        const calificaciones = Array.isArray(calificacionesResult[0]) ? calificacionesResult[0] : [];

        // Enviar los datos al frontend
        res.status(200).json({ calificaciones });
    } catch (error) {
        console.error('Error en el controlador:', error.message);
        res.status(500).json({ mensaje: 'Error interno del servidor', error: error.message });
    }
};































export const obtenerHijosPorToken = async (req, res) => {
    try {
        // Obtiene el token del encabezado de autorización
        const token = req.headers.authorization?.split(' ')[1];

        // Validar si el token está presente
        if (!token) {
            return res.status(401).json({ mensaje: 'Token no proporcionado' });
        }

        // Decodifica el token para extraer el cod_usuario
        let codUsuario;
        try {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            codUsuario = decodedToken.cod_usuario; // Extrae el cod_usuario del token
        } catch (err) {
            console.error('Error al decodificar el token:', err.message);
            return res.status(401).json({ mensaje: 'Token inválido o expirado.' });
        }

        // Validar si cod_usuario existe
        if (!codUsuario) {
            return res.status(400).json({ mensaje: 'El token no contiene un cod_usuario válido.' });
        }

        // Consulta para obtener cod_persona y cod_rol del usuario
        const [usuarioData] = await pool.query(
            `SELECT cod_persona, cod_rol 
             FROM tbl_usuarios 
             WHERE cod_usuario = ?`,
            [codUsuario]
        );

        // Validar si se encontró el usuario
        if (usuarioData.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontró un usuario con el cod_usuario proporcionado.' });
        }

        const { cod_persona, cod_rol } = usuarioData[0];

        // Validar que el rol sea el de un padre (cod_rol = 1)
        if (cod_rol !== 1) {
            return res.status(403).json({ mensaje: 'Acceso denegado: El usuario no tiene el rol de padre.' });
        }

        // Consulta para obtener los hijos asociados al padre
        const [result] = await pool.query(
            `SELECT p.cod_persona, p.nombre, p.primer_apellido, p.segundo_apellido, p.fecha_nacimiento
             FROM tbl_personas AS p
             INNER JOIN tbl_estructura_familiar AS ef ON ef.cod_persona_estudiante = p.cod_persona
             WHERE ef.cod_persona_padre = ? AND p.cod_tipo_persona = 1`,
            [cod_persona]
        );

        // Validar si se encontraron hijos
        if (result.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron hijos para este padre.' });
        }

        // Enviar respuesta con la lista de hijos
        res.status(200).json({ hijos: result });
    } catch (error) {
        console.error('Error al obtener los hijos del padre:', error);
        res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
    }
};