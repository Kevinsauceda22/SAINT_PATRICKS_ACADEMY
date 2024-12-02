import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: "7ec616001@smtp-brevo.com",
        pass: "5IztAckKmSBN07Ow"
    }
});



const getEmailTemplate = (content, title) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        :root {
            --primary-green: #009B3A;      /* Verde principal */
            --header-green: #00843F;       /* Verde para header */
            --button-green: #00A650;       /* Verde para botones */
            --hover-green: #008C46;        /* Verde hover */
            --background-color: #FFFFFF;    /* Fondo blanco */
            --text-color: #2C3E50;         /* Texto principal */
            --text-light: #FFFFFF;         /* Texto claro */
        }

        body {
            font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #F5F5F5;
            margin: 0;
            padding: 20px;
            color: var(--text-color);
            line-height: 1.6;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: var(--background-color);
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .header {
            background-color: var(--header-green);
            padding: 40px 20px;
            text-align: center;
            color: var(--text-light);
        }

        .header img {
            max-width: 140px;
            height: auto;
            margin-bottom: 20px;
        }

        .header h1 {
            color: var(--text-light);
            font-size: 28px;
            margin: 0;
            font-weight: 600;
            letter-spacing: 0.3px;
        }

        .content {
            padding: 40px;
            background-color: var(--background-color);
        }

        .welcome-text {
            font-size: 18px;
            color: var(--primary-green);
            font-weight: 600;
            margin-bottom: 20px;
            padding-left: 15px;
            border-left: 4px solid var(--primary-green);
        }

        .message-box {
            background-color: #F8F9FA;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }

        .verify-button {
            display: inline-block;
            background-color: var(--button-green);
            color: var(--text-light) !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
            transition: background-color 0.3s ease;
            border: none;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            cursor: pointer;
        }

        .verify-button:hover {
            background-color: var(--hover-green);
            text-decoration: none;
        }

        .link-box {
            background-color: #F8F9FA;
            border: 1px solid #E9ECEF;
            border-radius: 4px;
            padding: 15px;
            margin: 15px 0;
            word-break: break-all;
            font-family: monospace;
            font-size: 14px;
            color: var(--text-color);
        }

        .footer {
            background-color: #F8F9FA;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #E9ECEF;
        }

        .footer p {
            margin: 5px 0;
            color: #6C757D;
            font-size: 14px;
        }

        .social-links {
            margin-top: 20px;
        }

        .social-links a {
            color: var(--primary-green);
            text-decoration: none;
            margin: 0 10px;
            font-weight: 500;
        }

        @media (max-width: 480px) {
            .content {
                padding: 20px;
            }

            .verify-button {
                width: 100%;
                box-sizing: border-box;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://i.ibb.co/58kBnCh/Logo.png" alt="Saint Patrick's Academy Logo" />
            <h1>${title}</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>Saint Patrick's Academy</p>
            <p>&copy; ${new Date().getFullYear()} Todos los derechos reservados</p>
            <div class="social-links">
                <a href="#">Facebook</a> |
                <a href="#">Twitter</a> |
                <a href="#">Instagram</a>
            </div>
        </div>
    </div>
</body>
</html>
`;

// Añadir la nueva función de envío de credenciales temporales
const enviarCorreoCredencialesTemporales = async (correo_usuario, nombre_usuario, temporaryPassword) => {
    const content = `
        <div class="welcome-text">
            ¡Bienvenido a nuestra comunidad educativa, ${nombre_usuario}!
        </div>
        <div class="message-box">
            Nos complace darte la bienvenida a Saint Patrick's Academy. A continuación, encontrarás tus credenciales temporales de acceso:
        </div>

        <div class="message-box" style="background-color: #e8f5e9; border-left: 4px solid #4caf50;">
            <p style="margin: 0;"><strong>Credenciales de acceso:</strong></p>
            <div style="margin: 15px 0;">
                <p style="margin: 5px 0;"><strong>Usuario:</strong> ${nombre_usuario}</p>
                <p style="margin: 5px 0;"><strong>Contraseña temporal:</strong> ${temporaryPassword}</p>
            </div>
        </div>

        <div class="message-box" style="background-color: #fff3e0; border-left: 4px solid #ff9800;">
            <p><strong>⚠️ Importante:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Esta contraseña es temporal y deberás cambiarla en tu primer inicio de sesión.</li>
                <li>Por seguridad, no compartas estas credenciales con nadie.</li>
                <li>Te recomendamos usar una contraseña segura que incluya letras, números y símbolos.</li>
            </ul>
        </div>

        <div class="message-box">
            <p><strong>Pasos para comenzar:</strong></p>
            <ol style="margin: 10px 0; padding-left: 20px;">
                <li>Ingresa a la plataforma usando las credenciales proporcionadas</li>
                <li>Cambia tu contraseña temporal</li>
                <li>Completa tu perfil con la información requerida</li>
                <li>¡Comienza a explorar nuestra plataforma educativa!</li>
            </ol>
        </div>

        <div class="message-box" style="text-align: center;">
            <a href="${process.env.BASE_URL || 'http://localhost:3000'}/login" class="verify-button">
                Iniciar Sesión
            </a>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: 'Saint Patrick\'s Academy <maradigab30@gmail.com>',
            to: correo_usuario,
            subject: '¡Bienvenido! Tus Credenciales de Acceso - Saint Patrick\'s Academy',
            html: getEmailTemplate(content, 'Credenciales de Acceso'),
        });
        console.log('Correo de credenciales enviado correctamente');
        return true;
    } catch (error) {
        console.error('Error al enviar el correo de credenciales:', error.message);
        throw new Error('Error al enviar el correo con las credenciales');
    }
};

const enviarCorreoVerificacion = async (correo_usuario, nombre_usuario, token_usuario) => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/verificar-cuenta/${token_usuario}`;

    const content = `
        <div class="welcome-text">
            ¡Bienvenido a nuestra comunidad educativa, ${nombre_usuario}!
        </div>
        <div class="message-box">
            Nos complace darte la bienvenida a Saint Patrick's Academy. Para garantizar la seguridad de tu cuenta y comenzar tu experiencia educativa, necesitamos verificar tu dirección de correo electrónico.
        </div>
        <p style="text-align: center;">
            <a href="${verificationLink}" class="verify-button">Verificar mi cuenta</a>
        </p>
        <p>Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
        <div class="link-box">
            ${verificationLink}
        </div>
        <p>⚠️ Este enlace expirará en 24 horas por motivos de seguridad.</p>
    `;

    try {
        await transporter.sendMail({
            from: 'Saint Patrick\'s Academy <maradigab30@gmail.com>',
            to: correo_usuario,
            subject: '¡Bienvenido! Verifica tu cuenta - Saint Patrick\'s Academy',
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
        <div class="welcome-text">
            Solicitud de recuperación de contraseña
        </div>
        <div class="message-box">
            Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Saint Patrick's Academy. 
        </div>
        <p style="text-align: center;">
            <a href="${recuperacionLink}" class="verify-button">Restablecer contraseña</a>
        </p>
        <p>Si el botón no funciona, usa este enlace:</p>
        <div class="link-box">
            ${recuperacionLink}
        </div>
        <div class="message-box">
            <strong>Recomendaciones de seguridad:</strong>
            <ul style="margin-top: 10px;">
                <li>No compartas este enlace con nadie</li>
                <li>Usa una contraseña única y segura</li>
                <li>El enlace expirará en 1 hora</li>
            </ul>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: 'Saint Patrick\'s Academy <maradigab30@gmail.com>',
            to: correo,
            subject: 'Recuperación de Contraseña - Saint Patrick\'s Academy',
            html: getEmailTemplate(content, 'Recuperación de Contraseña'),
        });
        console.log('Correo de recuperación enviado correctamente');
    } catch (error) {
        console.error('Error al enviar el correo de recuperación:', error.message);
    }
};

const enviarNotificacionNuevaActividad = async (correo_padre, nombre_padre, actividad) => {
    const content = `
        <div class="welcome-text">
            <strong style="color: #000;"> Estimado/a ${nombre_padre}</strong>
        </div>
        <div class="message-box">
            Le informamos que se ha programado una nueva actividad académica para su hijo/a.
        </div>

        <div class="message-box" style="background-color: #e8f5e9; border-left: 4px solid #4caf50;">
            <p style="margin: 0; color: #000;"><strong>Detalles de la actividad programada:</strong></p>
            <div style="margin: 15px 0; color: #000;">
             <p style="margin: 5px 0; color: #000;"><strong>Grado:</strong> ${actividad.nombre_grado}</p> <!-- Cambio aquí -->
                <p style="margin: 5px 0; color: #000;"><strong>Sección:</strong> ${actividad.nombre_seccion}</p> <!-- Cambio aquí -->
                <p style="margin: 5px 0; color: #000;;"><strong>Nombre:</strong> ${actividad.nombre}</p>
                 <p style="margin: 5px 0; color: #000;;"><strong>Descripción:</strong> ${actividad.descripcion}</p>
                <p style="margin: 5px 0; color: #000;;"><strong>Fecha:</strong> ${actividad.fecha}</p>
                <p style="margin: 5px 0; color: #000;;"><strong>Hora:</strong> ${actividad.hora}</p>
               
            </div>
        </div>

        <div class="message-box" style="background-color: #fff3e0; border-left: 4px solid #ff9800;">
            <p><strong>⚠️ Importante:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px; color: #000;">
                <li>Por favor, tome nota de la fecha y hora de la actividad.</li>
                <li>Asegúrese de que su hijo/a cuente con los materiales necesarios.</li>
                <li>Si tiene alguna pregunta, no dude en contactar con el profesor responsable.</li>
            </ul>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: 'Saint Patrick\'s Academy <maradigab30@gmail.com>',
            to: correo_padre,
            subject: 'Nueva Actividad Académica - Saint Patrick\'s Academy',
            html: getEmailTemplate(content, 'Nueva Actividad Académica'),
        });
        console.log('Correo de nueva actividad enviado correctamente');
        return true;
    } catch (error) {
        console.error('Error al enviar el correo de nueva actividad:', error.message);
        throw new Error('Error al enviar el correo de notificación de nueva actividad');
    }
};
const enviarNotificacionCancelacionActividad = async (correo_padre, nombre_padre, actividad) => {
    const content = `
    <div class="welcome-text">
        <strong style="color: #000;">Estimado/a ${nombre_padre},</strong>
    </div>
    <div class="message-box" style="background-color: #ffebee; border-left: 4px solid #ef5350; padding: 10px;">
        <p ><strong style="color: #000;">Aviso Importante:</strong></p>
        <p style="color: #000;">Le informamos que la siguiente actividad académica ha sido cancelada.</p>
        <p><strong>Motivo de la cancelación:</strong> ${actividad.motivo_cancelacion}</p> <!-- Mostrar motivo -->
    </div>

    <div class="message-box" style="background-color: #fff3e0; border-left: 4px solid #ff9800;">
        <p style="margin: 0; color: #000;"><strong>Detalles de la actividad cancelada:</strong></p>
        <div style="margin: 15px 0; color: #000;">
            <p style="margin: 5px 0; color: #000;"><strong>Grado:</strong> ${actividad.nombre_grado}</p>
            <p style="margin: 5px 0; color: #000;"><strong>Sección:</strong> ${actividad.nombre_seccion}</p>
            <p style="margin: 5px 0; color: #000;"><strong>Nombre:</strong> ${actividad.nombre}</p>
            <p style="margin: 5px 0; color: #000;"><strong>Descripción:</strong> ${actividad.descripcion}</p>
            <p style="margin: 5px 0; color: #000;"><strong>Fecha:</strong> ${actividad.fecha}</p>
            <p style="margin: 5px 0; color: #000;"><strong>Hora:</strong> ${actividad.hora}</p>
        </div>
    </div>

    <div class="message-box" style="padding: 10px;">
        <p>En caso de que la actividad sea reprogramada, se le notificará oportunamente a través de un nuevo correo electrónico.</p>
        <p>Lamentamos cualquier inconveniente que esto pueda causar.</p>
    </div>
    `;

    try {
        await transporter.sendMail({
            from: 'Saint Patrick\'s Academy <maradigab30@gmail.com>',
            to: correo_padre,
            subject: 'Cancelación de Actividad Académica - Saint Patrick\'s Academy',
            html: getEmailTemplate(content, 'Cancelación de Actividad'),
        });
        console.log(`Correo enviado a ${correo_padre}`);
    } catch (error) {
        console.error('Error al enviar el correo de cancelación:', error.message);
        throw new Error('Error al enviar el correo de notificación de cancelación');
    }
};


const enviarNotificacionCambioActividad = async (correo_padre, nombre_padre, actividad_actual) => {
    const content = `
        <div class="welcome-text">
          <strong style="color: #000;"> Estimado/a ${nombre_padre}</strong>
        </div>
        <div class="message-box" style="background-color: #fffde7; border-left: 4px solid #ffeb3b;">
            <p><strong>Aviso Importante:</strong></p>
            <p>Le informamos que la siguiente actividad académica ha sido actualizada:</p>
        </div>
      
        <div class="message-box" style="background-color: #e8f5e9; border-left: 4px solid #4caf50;">
         <p style="margin: 0; color: #000;"><strong>Detalles de la actividad actualizada:</strong></p>
            <div style="margin: 15px 0; color: #000;">
               <p style="margin: 5px 0; color: #000;"><strong >Grado:</strong> ${actividad_actual.grado}</p>
               <p style="margin: 5px 0; color: #000;"><strong >Sección:</strong> ${actividad_actual.seccion}</p>
                <p style="margin: 5px 0; color: #000;"><strong >Nombre:</strong> ${actividad_actual.nombre}</p>
                <p style="margin: 5px 0; color: #000;"><strong >Descripción:</strong> ${actividad_actual.descripcion}</p>
                <p style="margin: 5px 0; color: #000;"><strong >Fecha:</strong> ${actividad_actual.fecha}</p>
                <p style="margin: 5px 0; color: #000;"><strong >Hora:</strong> ${actividad_actual.hora}</p>
                

            </div>
        </div>

        <div class="message-box">
            <p>Por favor, tome nota de los nuevos detalles de la actividad. Agradecemos su atención y comprensión.</p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: 'Saint Patrick\'s Academy <maradigab30@gmail.com>',
            to: correo_padre,
            subject: 'Actualización de Actividad Académica - Saint Patrick\'s Academy',
            html: getEmailTemplate(content, 'Actualización de Actividad Académica'),
        });
        console.log('Correo de actualización de actividad enviado correctamente');
        return true;
    } catch (error) {
        console.error('Error al enviar el correo de actualización:', error.message);
        throw new Error('Error al enviar el correo de notificación de actualización');
    }
};





export { 
    enviarCorreoVerificacion, 
    enviarCorreoRecuperacion, 
    enviarCorreoCredencialesTemporales,
    enviarNotificacionNuevaActividad,
    enviarNotificacionCancelacionActividad,
    enviarNotificacionCambioActividad
};
