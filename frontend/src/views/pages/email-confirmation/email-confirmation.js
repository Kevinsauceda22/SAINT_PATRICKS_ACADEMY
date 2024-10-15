// ConfirmacionEmail.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './ConfirmacionEmail.css'; // Importar el archivo CSS

const ConfirmacionEmail = () => {
    const { correo } = useParams(); // Obtiene el correo de los parámetros de la URL
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        // Simula un retraso para mostrar el spinner
        const timer = setTimeout(() => {
            setCargando(false); // Cambia el estado después de 3 segundos
        }, 30000000000000000); // Ajusta el tiempo según tus necesidades

        return () => clearTimeout(timer); // Limpiar el temporizador al desmontar
    }, []);

    return (
        <div className="verificar-cuenta-container">
            <h2 className="title">Ahora Confirmaremos tu correo</h2>
            <p className="message">
                Hemos enviado un correo de confirmación a <strong>{correo}</strong>.
                Por favor, revisa tu bandeja de entrada y haz clic en el enlace de confirmación.
                Si no encuentras el correo, revisa la carpeta de spam.
            </p>
            {cargando ? (
                <div className="spinner-container">
                    <div className="loading-spinner"></div>
                    <p className="loading-message">Esperando confirmación... Puedes cerrar esta pestaña y continuar con el registro desde el correo</p>
                </div>
            ) : (
                <p className="thank-you-message">
                    Gracias por tu paciencia. Una vez que confirmes tu correo, podrás iniciar sesión.
                </p>
            )}
        </div>
    );
};

export default ConfirmacionEmail;
