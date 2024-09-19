const mysql = require('mysql2');

// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',    
    password: '',
    database: 'saintpatrickacademy' 
});

// Conectarse a la base de datos
connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.stack);
        return;
    }
    console.log('Conexión establecida con la base de datos, ID de conexión: ' + connection.threadId);
});

// Exportar la conexión para usarla en otros módulos
module.exports = connection;
