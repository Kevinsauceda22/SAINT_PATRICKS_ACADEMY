import React, { useState } from 'react';
import axios from 'axios'; // Asegúrate de tener axios instalado
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(''); // Para manejar mensajes de error
  const [successMessage, setSuccessMessage] = useState(''); // Para manejar mensajes de éxito

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(''); // Reiniciar mensajes
    setSuccessMessage('');

    try {
      // Realizar la solicitud de inicio de sesión
      const response = await axios.post('/api/usuarios/login', {
        identificador: email,
        contraseña_usuario: password,
      });

      // Si el login es exitoso, guarda el token (puedes usar localStorage o un contexto)
      const { token } = response.data;
      console.log('Token:', token);
      setSuccessMessage('¡Inicio de sesión exitoso!');

      // Aquí puedes redirigir al usuario a otra página o hacer cualquier otra acción
      // Ejemplo: window.location.href = '/dashboard';

    } catch (error) {
      // Manejo de errores
      if (error.response) {
        // La solicitud fue realizada y el servidor respondió con un código de estado que no está en el rango de 2xx
        setErrorMessage(error.response.data.mensaje || 'Error al iniciar sesión');
      } else {
        // La solicitud fue realizada pero no se recibió respuesta
        setErrorMessage('Error de red');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.leftContent}>
          <h2 className={styles.welcomeText}>¡Bienvenido de vuelta!</h2>
          <p className={styles.welcomeDesc}>Sistema de Gestión Educativa</p>
          <div className={styles.illustration}>
            {/* Aquí podrías agregar una ilustración o imagen */}
            <div className={styles.illustrationCircle}></div>
            <div className={styles.illustrationSquare}></div>
          </div>
        </div>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.loginContainer}>
          <div className={styles.logo}>
            <div className={styles.logoCircle}></div>
            <span className={styles.logoText}>EduSystem</span>
          </div>

          <h1 className={styles.title}>Iniciar Sesión</h1>
          
          {/* Mostrar mensajes de error o éxito */}
          {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}
          {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

          <form className={styles.form} onSubmit={handleLogin}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Correo Electrónico</label>
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Contraseña</label>
              <input
                type="password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <a href="#" className={styles.forgotPassword}>¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" className={styles.loginButton}>
              Ingresar
            </button>
          </form>

          <div className={styles.divider}>
            <span className={styles.dividerText}>o</span>
          </div>

          <div className={styles.preRegisterContainer}>
            <p className={styles.preRegisterText}>¿Eres Padre de Familia o Tutor?</p>
            <button 
              className={styles.preRegisterButton}
              onClick={() => console.log('Navegando al pre-registro')}
            >
              Pre-Regístrate Aquí
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
