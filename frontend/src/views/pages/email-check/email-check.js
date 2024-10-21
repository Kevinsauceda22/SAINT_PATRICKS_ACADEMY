import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CorreoVerificado = () => {
    const navigate = useNavigate();
    const nombre = localStorage.getItem('nombre'); // Obtener el nombre del localStorage
    const primer_apellido = localStorage.getItem('primer_apellido'); // Obtener el primer apellido del localStorage

    // Redirigir al login después de 10 segundos
    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/login'); // Redirigir al login
        }, 10000); // 10 segundos

        // Limpiar el timeout al desmontar el componente
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>¡Hola {nombre} {primer_apellido}!</h2>
            <p style={styles.message}>
                Tu cuenta ha sido confirmada. Puedes cerrar esta ventana y dirigirte a la página de inicio de sesión. O espera 10 segundos y serás redirigido automáticamente.
            </p>
            <p style={styles.timerMessage}>
                Serás redirigido a la página de inicio de sesión en 10 segundos...
            </p>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        padding: '20px',
        backgroundColor: '#f0f4f8',
        fontFamily: 'Arial, sans-serif',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
    },
    title: {
        fontSize: '24px',
        color: '#333',
        marginBottom: '10px',
        padding: '20px',
        backgroundColor: '#4CAF50',
        color: '#fffffff1',
        borderRadius: '5px',
    },
    message: {
        fontSize: '18px',
        color: '#555',
        marginBottom: '20px',
        maxWidth: '600px',
    },
    timerMessage: {
        fontSize: '16px',
        color: '#888',
        marginTop: '10px',
    },
};

export default CorreoVerificado;
