const nodemailer = require('nodemailer');
require('dotenv').config(); // Asegúrate de cargar dotenv

// Configuración del transporte utilizando Mailtrap
const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io', // Asegúrate de que sea 'sandbox.smtp.mailtrap.io'
    port: 2525,
    auth: {
        user: process.env.MAILTRAP_USER, // Usuario de Mailtrap desde el .env
        pass: process.env.MAILTRAP_PASS,  // Contraseña de Mailtrap desde el .env
    },
});

module.exports = transporter;
