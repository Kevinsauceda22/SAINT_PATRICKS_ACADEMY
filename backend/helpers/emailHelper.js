import dotenv from 'dotenv';
import { Resend } from 'resend';
const logo = `/emailsimgs/logo_saint_patrick`;

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const getEmailTemplate = (content, title) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f6f9fc;
            color: #333333;
        }
        .wrapper {
            background-color: #f6f9fc;
            padding: 40px 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #009f4d 0%, #006e36 100%);
            padding: 30px 0;
            text-align: center;
            position: relative;
        }
        .header::after {
            content: '';
            position: absolute;
            bottom: -20px;
            left: 0;
            right: 0;
            height: 40px;
            background-color: #ffffff;
            border-radius: 50% 50% 0 0;
        }
        .logo {
            max-width: 180px;
            height: auto;
            margin-bottom: 10px;
        }
        .header-title {
            color: #ffffff;
            margin: 10px 0 0;
            font-size: 24px;
            font-weight: 600;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
        }
        .content {
            padding: 40px 40px 30px;
            color: #4a5568;
        }
        .button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #009f4d 0%, #006e36 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 25px 0;
            text-align: center;
            transition: transform 0.2s ease;
            box-shadow: 0 4px 6px rgba(0, 159, 77, 0.2);
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 8px rgba(0, 159, 77, 0.25);
        }
        .message-box {
            background-color: #f8fafc;
            border-left: 4px solid #009f4d;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e2e8f0, transparent);
            margin: 25px 0;
        }
        .footer {
            text-align: center;
            padding: 30px 40px;
            background-color: #f8fafc;
            border-top: 1px solid #e2e8f0;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-link {
            display: inline-block;
            margin: 0 10px;
            color: #009f4d;
            text-decoration: none;
            font-weight: 500;
        }
        .footer-text {
            color: #718096;
            font-size: 13px;
            margin: 5px 0;
        }
        .highlight {
            background-color: #e6ffed;
            padding: 2px 5px;
            border-radius: 4px;
            font-weight: 500;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 30px 20px;
            }
            .header-title {
                font-size: 20px;
            }
            .button {
                padding: 12px 25px;
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <img src="${logo}" alt="Saint Patrick's Academy Logo" class="logo">
                <h1 class="header-title">${title}</h1>
            </div>
            <div class="content">
                ${content}
            </div>
            <div class="footer">
                <div class="social-links">
                    <a href="#" class="social-link">Facebook</a>
                    <a href="#" class="social-link">Instagram</a>
                    <a href="#" class="social-link">Twitter</a>
                </div>
                <p class="footer-text">© ${new Date().getFullYear()} Saint Patrick's Academy</p>
                <p class="footer-text">Todos los derechos reservados</p>
                <p class="footer-text">Este es un correo electrónico automático, por favor no responda a este mensaje.</p>
            </div>
        </div>
    </div>
</body>
</html>
`;

const enviarCorreoVerificacion = async (correo_usuario, nombre_usuario, token_usuario) => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/verificar-cuenta/${token_usuario}`;

    const content = `
        <div class="message-box">
            <p>¡Bienvenido a nuestra comunidad educativa, <span class="highlight">${nombre_usuario}</span>!</p>
        </div>
        <p>Nos complace darte la bienvenida a Saint Patrick's Academy. Para garantizar la seguridad de tu cuenta y comenzar tu experiencia educativa, necesitamos verificar tu dirección de correo electrónico.</p>
        <div style="text-align: center;">
            <a href="${verificationLink}" class="button">Verificar mi cuenta</a>
        </div>
        <div class="divider"></div>
        <p style="font-size: 14px;">Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:</p>
        <p style="word-break: break-all; font-size: 12px; color: #666;">${verificationLink}</p>
        <div class="message-box" style="background-color: #fff8f8; border-left-color: #ff4444;">
            <p style="margin: 0; font-size: 13px;">Por seguridad, este enlace expirará en 24 horas. Si no has solicitado esta verificación, puedes ignorar este mensaje.</p>
        </div>
    `;

    try {
        await resend.emails.send({
            from: 'Saint Patrick\'s Academy <onboarding@resend.dev>',
            to: correo_usuario,
            subject: '¡Bienvenido a Saint Patrick\'s Academy! - Verifica tu cuenta',
            html: getEmailTemplate(content, 'Verificación de Cuenta'),
        });
        console.log('Correo de verificación enviado correctamente');
    } catch (error) {
        console.error('Error al enviar el correo de verificación:', error.message);
    }
};

const enviarCorreoRecuperacion = async (correo, token) => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const recuperacionLink = `${baseUrl}/olvide-password/${token}`;

    const content = `
        <div class="message-box">
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
        </div>
        <p>No te preocupes, te ayudaremos a recuperar el acceso a tu cuenta de forma segura. Para crear una nueva contraseña, simplemente haz clic en el botón a continuación:</p>
        <div style="text-align: center;">
            <a href="${recuperacionLink}" class="button">Restablecer mi contraseña</a>
        </div>
        <div class="divider"></div>
        <p style="font-size: 14px;">Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:</p>
        <p style="word-break: break-all; font-size: 12px; color: #666;">${recuperacionLink}</p>
        <div class="message-box" style="background-color: #fff8f8; border-left-color: #ff4444;">
            <p style="margin: 0; font-size: 13px;">Por tu seguridad, este enlace expirará en 1 hora. Si no has solicitado restablecer tu contraseña, por favor ignora este mensaje o contacta con soporte técnico.</p>
        </div>
    `;

    try {
        await resend.emails.send({
            from: 'Saint Patrick\'s Academy <onboarding@resend.dev>',
            to: correo,
            subject: 'Recuperación de Contraseña - Saint Patrick\'s Academy',
            html: getEmailTemplate(content, 'Recuperación de Contraseña'),
        });
        console.log('Correo de recuperación enviado correctamente');
    } catch (error) {
        console.error('Error al enviar el correo de recuperación:', error.message);
    }
};

export { enviarCorreoVerificacion, enviarCorreoRecuperacion };