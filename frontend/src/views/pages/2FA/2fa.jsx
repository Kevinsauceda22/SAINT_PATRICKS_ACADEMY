import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Auth2FA = () => {
  const [twoFACode, setTwoFACode] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tempIdentificador = localStorage.getItem('temp_identificador'); // Obtener el identificador guardado

    try {
      const response = await axios.post('http://localhost:4000/api/usuarios/verify-2fa', {
        identificador: tempIdentificador,
        code: twoFACode.replace('-', ''), // Eliminar el guion antes de enviar el código
      });

      // Si la verificación es exitosa
      localStorage.setItem('token', response.data.token); // Guardar el token
      navigate('/dashboard'); // Redirigir al dashboard
      window.location.reload(); // Refrescar la página para cargar datos nuevos
    } catch (error) {
      console.error('Error en 2FA:', error);
      alert('Código de verificación incorrecto, por favor intenta de nuevo.');
    }
  };

  // Formatear el código con el guion en el formato XXX-XXX
  const handleInputChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Solo permitir números
    if (value.length > 3) {
      value = value.slice(0, 3) + '-' + value.slice(3, 6); // Insertar el guion
    }
    setTwoFACode(value);
  };

  // Estilos en línea
  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f0f4f8',
    },
    form: {
      backgroundColor: '#ffffff',
      padding: '40px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      maxWidth: '400px',
      width: '100%',
      textAlign: 'center',
    },
    heading: {
      fontSize: '24px',
      marginBottom: '20px',
      color: '#333',
    },
    input: {
      width: '100%',
      padding: '10px',
      margin: '10px 0',
      fontSize: '16px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      boxSizing: 'border-box',
    },
    button: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#007bff',
      color: 'white',
      fontSize: '16px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
    buttonHover: {
      backgroundColor: '#0056b3',
    },
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2 style={styles.heading}>Verificación de 2FA</h2>
        <input
          type="text"
          value={twoFACode}
          onChange={handleInputChange}
          placeholder="Ingresa tu código 2FA"
          style={styles.input}
          required
          maxLength="7" // Máximo de 7 caracteres (incluido el guion)
        />
        <button type="submit" style={styles.button}>Verificar</button>
      </form>
    </div>
  );
};

export default Auth2FA;
