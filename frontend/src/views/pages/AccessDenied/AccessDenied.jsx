import React from 'react';

const AccessDenied = () => {
  const styles = {
    container: {
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#ffffff',
      fontFamily: 'Arial, sans-serif',
      color: '#333333',
      margin: 0,
      padding: 0,
    },
    icon: {
      width: '100px',
      height: '100px',
      background: '#ff4444',
      borderRadius: '50%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '20px',
      animation: 'pulse 2s infinite',
    },
    exclamation: {
      color: 'white',
      fontSize: '60px',
      fontWeight: 'bold',
    },
    title: {
      fontSize: '32px',
      marginBottom: '10px',
      textAlign: 'center',
    },
    message: {
      fontSize: '18px',
      color: '#666666',
      textAlign: 'center',
      maxWidth: '400px',
    },
    button: {
      marginTop: '30px',
      padding: '12px 24px',
      background: '#ff4444',
      border: 'none',
      borderRadius: '5px',
      color: 'white',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'background 0.3s',
    },
    '@keyframes pulse': {
      '0%': {
        transform: 'scale(1)',
        boxShadow: '0 0 0 0 rgba(255, 68, 68, 0.7)',
      },
      '70%': {
        transform: 'scale(1.1)',
        boxShadow: '0 0 0 10px rgba(255, 68, 68, 0)',
      },
      '100%': {
        transform: 'scale(1)',
        boxShadow: '0 0 0 0 rgba(255, 68, 68, 0)',
      },
    },
  };

  const handleGoBack = () => {
    window.history.back();
  };

  // Agregar la animación al documento
  React.useEffect(() => {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
      @keyframes pulse {
        0% {
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.7);
        }
        70% {
          transform: scale(1.1);
          box-shadow: 0 0 0 10px rgba(255, 68, 68, 0);
        }
        100% {
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(255, 68, 68, 0);
        }
      }
    `;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.icon}>
        <span style={styles.exclamation}>!</span>
      </div>
      <h1 style={styles.title}>Acceso Denegado</h1>
      <p style={styles.message}>Lo sentimos, no tienes permiso para acceder a esta página.</p>
      <button 
        style={styles.button}
        onClick={handleGoBack}
        onMouseOver={(e) => e.currentTarget.style.background = '#ff6666'}
        onMouseOut={(e) => e.currentTarget.style.background = '#ff4444'}
      >
        Volver atrás
      </button>
    </div>
  );
};

export default AccessDenied;