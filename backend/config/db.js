// db.js

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool; 

const conectarDB = async () => {
    if (!pool) { 
        try {
            pool = mysql.createPool({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                port: process.env.DB_PORT || 3306, // Puerto de conexión
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0,
                connectTimeout: 10000000 // Tiempo de espera en milisegundos
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
