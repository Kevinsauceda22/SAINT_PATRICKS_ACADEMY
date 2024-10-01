import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

const verificarToken = (req, res, next) => {
    // Obtener el token desde el header (usualmente se envía en 'Authorization')
    const token = req.header('Authorization')?.split(' ')[1];

    // Verificar si el token fue proporcionado
    if (!token) {
        return res.status(403).json({ mensaje: 'Acceso denegado.' });
    }

    try {
        // Verificar si el token es válido usando la clave secreta JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded; // Guardar los datos del usuario decodificados en el request

        next(); // Continuar con la siguiente función o ruta
    } catch (error) {
        // Manejar el error si el token no es válido o expiró
        res.status(401).json({ mensaje: 'Token inválido o ha expirado' });
    }
};

export default verificarToken;
