// CorreoVerificado.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CorreoVerificado.css';

const CorreoVerificado = () => {
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(10);
    const nombre = localStorage.getItem('nombre');
    const primer_apellido = localStorage.getItem('primer_apellido');

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        const navigationTimer = setTimeout(() => {
            navigate('/login');
        }, 10000);

        return () => {
            clearInterval(timer);
            clearTimeout(navigationTimer);
        };
    }, [navigate]);

    return (
        <div className="verification-container">
            <div className="verification-card">
                <div className="content-wrapper">
                    <div className="icon-circle">
                        <svg 
                            className="check-icon" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>

                    <h2 className="verification-title">
                        ¡Bienvenido{nombre ? `, ${nombre} ${primer_apellido}` : ''}!
                    </h2>

                    <div className="divider"></div>

                    <p className="verification-message">
                        Tu cuenta ha sido verificada exitosamente. Ya puedes acceder a todos nuestros servicios.
                    </p>

                    <div className="timer-container">
                        <svg 
                            className="timer-icon" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span className="timer-text">
                            Redirigiendo en <span className="timer-count">{countdown}</span> segundos
                        </span>
                    </div>

                    <button 
                        className="login-button"
                        onClick={() => navigate('/login')}
                    >
                        Ir al inicio de sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CorreoVerificado;