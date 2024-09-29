import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool; // Declaramos una variable para el pool

const conectarDB = async () => {
    if (!pool) { // Solo creamos el pool si no existe
        try {
            pool = mysql.createPool({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });
            console.log('Conexión establecida con la base de datos.');
        } catch (err) {
            console.error('Error al conectar a la base de datos:', err);
            process.exit(1);
        }
    }
    return pool;
};

export default conectarDB;
