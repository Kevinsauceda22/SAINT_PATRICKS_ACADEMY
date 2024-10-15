import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './VerificarCuenta.css'; // Asegúrate de tener este archivo CSS

const VerificarCuenta = () => {
    const { token_usuario } = useParams(); // Obtener el token de los parámetros de la URL
    const navigate = useNavigate();
    const [mensaje, setMensaje] = useState('Confirmando tu cuenta...'); // Estado para manejar el mensaje
    const [tokenValido, setTokenValido] = useState(true); // Estado para manejar si el token es válido

    useEffect(() => {
        const confirmarCuenta = async () => {
            try {
                const response = await fetch(`http://localhost:4000/api/usuarios/confirmar/${token_usuario}`, {
                    method: 'GET', // Usar GET para confirmar la cuenta
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    // Redirigir a la página de correo verificado
                    navigate('/correo-verificado');
                } else {
                    const errorData = await response.json();
                    // Manejar el error según el mensaje devuelto
                    if (errorData.message === 'El token ha expirado.') {
                        setMensaje('Token de confirmación ya expirado.');
                        setTokenValido(false); // Marcar que el token no es válido
                    } else if (errorData.message === 'Token de verificación ya no está disponible.') {
                        setMensaje('Token de verificación ya no está disponible.');
                        setTokenValido(false); // Marcar que el token no es válido
                    } else {
                        console.error('Error al confirmar la cuenta:', errorData.message);
                        setMensaje('Token de confirmación ya expirado.');
                        setTokenValido(false); // Marcar que el token no es válido
                    }
                }
            } catch (error) {
                console.error('Error en la solicitud de confirmación:', error);
                setMensaje('Error en la solicitud de confirmación. Intenta nuevamente.');
                setTokenValido(false); // Marcar que el token no es válido
            }
        };

        confirmarCuenta(); // Llamar a la función cuando se monte el componente
    }, [navigate, token_usuario]); // Dependencias

    return (
        <div className="verificar-cuenta-container">
            <h2>Verificar Cuenta</h2>
            <p>{mensaje}</p>
            {/* Mostrar X si el token no es válido, de lo contrario mostrar el spinner */}
            {!tokenValido ? (
                <div className="error-icon">❌</div> // Cambiar el spinner por una X
            ) : (
                <div className="loading-spinner" />
            )}
        </div>
    );
};

export default VerificarCuenta;
