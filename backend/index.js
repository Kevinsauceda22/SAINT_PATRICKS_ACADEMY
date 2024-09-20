import express from 'express';
import { conectarDB } from './config/db.js'; // Asegúrate de que la ruta sea correcta

const app = express();
const PORT = 4000; // Puedes cambiarlo si es necesario

// Conectar a la base de datos
conectarDB();

// Middleware para manejar JSON
app.use(express.json());

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor backend en ejecución en el puerto ${PORT}`);
});
