import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const checkAuth = (req, res, next) => {
    console.log('Middleware checkAuth ejecutado en la ruta:', req.originalUrl);

    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ mensaje: 'Acceso denegado.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;

        next();
    } catch (error) {
        res.status(401).json({ mensaje: 'Token inválido o ha expirado' });
    }
};

export default checkAuth;
