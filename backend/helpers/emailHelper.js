import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuración del transporter de nodemailer para Brevo
// Looking to send emails in production? Check out our Email API/SMTP product!
const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "dc63658321cf33",
      pass: "1a4e145f35bfb3"
    }
  });

// Función para obtener la plantilla de correo
const getEmailTemplate = (content, title) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #777777;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${title}</h1>
        </div>
        <div>
            ${content}
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Saint Patrick's Academy. Todos los derechos reservados.</p>
        </div>
    </div>
</body>
</html>
`;

// Función para enviar el correo de verificación
const enviarCorreoVerificacion = async (correo_usuario, nombre_usuario, token_usuario) => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/verificar-cuenta/${token_usuario}`;

    const content = `
        <p>Hola ${nombre_usuario},</p>
        <p>¡Bienvenido a Saint Patrick's Academy!</p>
        <p>Por favor, verifica tu cuenta haciendo clic en el siguiente enlace:</p>
        <a href="${verificationLink}">Verificar Cuenta</a>
        <p>Si no solicitaste esta verificación, puedes ignorar este mensaje.</p>
    `;

    try {
        await transporter.sendMail({
            from: 'Saint Patrick\'s Academy <onboarding@brevo.com>', // Cambia esto si es necesario
            to: correo_usuario,
            subject: '¡Bienvenido a Saint Patrick\'s Academy! - Verifica tu cuenta',
            html: getEmailTemplate(content, 'Verificación de Cuenta'),
        });
        console.log('Correo de verificación enviado correctamente');
    } catch (error) {
        console.error('Error al enviar el correo de verificación:', error.message);
    }
};

// Función para enviar el correo de recuperación
const enviarCorreoRecuperacion = async (correo, token) => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const recuperacionLink = `${baseUrl}/olvide-password/${token}`;

    const content = `
        <p>Hola,</p>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para hacerlo:</p>
        <a href="${recuperacionLink}">Recuperar Contraseña</a>
        <p>Si no solicitaste este cambio, ignora este correo.</p>
    `;

    try {
        await transporter.sendMail({
            from: 'Saint Patrick\'s Academy <onboarding@brevo.com>', // Cambia esto si es necesario
            to: correo,
            subject: 'Recuperación de Contraseña - Saint Patrick\'s Academy',
            html: getEmailTemplate(content, 'Recuperación de Contraseña'),
        });
        console.log('Correo de recuperación enviado correctamente');
    } catch (error) {
        console.error('Error al enviar el correo de recuperación:', error.message);
    }
};

// Exportar las funciones para usarlas en otros módulos
export { enviarCorreoVerificacion, enviarCorreoRecuperacion };
