import express from 'express';
import dotenv from 'dotenv';
import conectarDB from './config/db.js'; 
import usuariosRoutes from './routes/usuario_routes.js'; // Asegúrate de la ruta correcta

dotenv.config(); 

const app = express();

const init = async () => {
    await conectarDB();
};

init();

app.use(express.json());

// Usar las rutas de usuarios
app.use('/api/usuarios', usuariosRoutes); // Todas las rutas de usuarios estarán disponibles en /api/usuarios

const PORT = process.env.PORT || 4000;

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor backend en ejecución en el puerto ${PORT}`);
});
