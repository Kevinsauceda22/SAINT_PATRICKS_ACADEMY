import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
export const checkAuth = (req, res, next) => {
    console.log('Middleware checkAuth ejecutado en la ruta:', req.originalUrl);
  
    const authHeader = req.headers.authorization; // Obtener el encabezado Authorization
    if (!authHeader) {
      console.log('Encabezado Authorization no encontrado');
      return res.status(403).json({ mensaje: 'Acceso denegado. Token no proporcionado.' });
    }
  
    const token = authHeader.split(' ')[1]; // Obtener el token después de "Bearer"
    console.log('Token recibido:', token);
  
    if (!token) {
      return res.status(403).json({ mensaje: 'Acceso denegado. Token no proporcionado.' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verificar el token
      console.log('Token decodificado:', decoded);
      req.usuario = decoded; // Adjuntar datos del usuario al request
      next(); // Continuar con la solicitud
    } catch (error) {
      console.error('Error al verificar token:', error.message);
      return res.status(401).json({ mensaje: 'Token inválido o ha expirado.' });
    }
  };
export default checkAuth;
