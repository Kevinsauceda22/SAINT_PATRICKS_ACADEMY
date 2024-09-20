import mysql from 'mysql2/promise';

// Configuración de la conexión a la base de datos esto deben de meterlo en una varaible de entorno
const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'saintpatrickacademy'
});

// Función para conectarse a la base de datos
const conectarDB = async () => {
    try {
        // Intenta conectar a la base de datos 
        await connection.connect();
        console.log('Conexión establecida con la base de datos, ID de conexión: ' + connection.threadId);
    } catch (err) {
        console.error('Error al conectar a la base de datos:', err.stack);
        process.exit(1); 
    }
};

export { connection, conectarDB };
