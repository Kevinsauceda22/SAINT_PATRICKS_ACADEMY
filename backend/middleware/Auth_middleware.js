import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const checkAuth = (req, res, next) => {
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

export default checkAuth;
