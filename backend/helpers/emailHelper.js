// helpers/emailHelper.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

// Configuración del transporte utilizando Mailtrap
const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525, // Puedes probar con otros puertos si es necesario
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
    },
});

// Función para enviar correo de verificación
const enviarCorreoVerificacion = async (correo_usuario, nombre_usuario, token_usuario) => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000'; // URL base desde el .env

    // Aquí ajustamos la URL de verificación para que apunte al componente correcto
    const verificationLink = `${baseUrl}/#/verificar-cuenta/${token_usuario}`;

    const mailOptions = {
        from: 'SAINT PATRICK´S ACADEMY <stevenflores0522@gmail.com>',
        to: correo_usuario,
        subject: 'Verificación de cuenta',
        html: `<p>Hola ${nombre_usuario},</p>
               <p>Por favor, verifica tu cuenta haciendo clic en el siguiente enlace:</p>
               <a href="${verificationLink}">Verificar cuenta</a>`, // Usar la nueva URL de verificación
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo de verificación enviado correctamente');
    } catch (error) {
        console.error('Error al enviar el correo de verificación:', error.message); // Manejo de errores
    }
};

// Función para enviar correo de recuperación
const enviarCorreoRecuperacion = async (correo, token) => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000'; // URL base desde el .env
    const recuperacionLink = `${baseUrl}/#/olvide-password/${token}`; // Corregido el uso de token

    const mailOptions = {
        from: 'SAINT PATRICK´S ACADEMY <stevenflores0522@gmail.com>',
        to: correo,
        subject: 'Recuperación de Contraseña Saint Patrick´s Academy',
        html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
               <a href="${recuperacionLink}">Restablecer contraseña</a>`, // Usar HTML para mantener la consistencia
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Correo de recuperación enviado correctamente');
    } catch (error) {
        console.error('Error al enviar el correo de recuperación:', error.message); // Manejo de errores
    }
};

// Exportar ambas funciones
export { enviarCorreoVerificacion, enviarCorreoRecuperacion };
