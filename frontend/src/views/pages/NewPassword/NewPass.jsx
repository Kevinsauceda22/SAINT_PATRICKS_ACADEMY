import React, { useState } from 'react';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import './NewPass.css';
import LogoSaipat from '../../../../src/assets/images/Logo.png'; // Asegúrate de que la ruta sea correcta
import 'react-toastify/dist/ReactToastify.css';

const NewPasswordPage = () => {
  // Estados
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const generatePassword = () => {
    // Generar contraseña según los requisitos de seguridad
    const length = 12;
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const digits = "0123456789";
    const specialChars = "@#$%&*!";

    let newPassword = '';
    newPassword += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    newPassword += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    newPassword += digits.charAt(Math.floor(Math.random() * digits.length));
    newPassword += specialChars.charAt(Math.floor(Math.random() * specialChars.length));

    while (newPassword.length < length) {
      const charPool = lowercase + uppercase + digits + specialChars;
      newPassword += charPool.charAt(Math.floor(Math.random() * charPool.length));
    }

    newPassword = newPassword.split('').sort(() => 0.5 - Math.random()).join('');
    
    setPassword(newPassword);
    setConfirmPassword(newPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%&*!])[A-Za-z\d@#$%&*!]{8,}$/;

    if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
    } else if (!passwordRegex.test(password)) {
        setError('La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, un número y un carácter especial');
        return;
    }

    setError('');

    try {
        const token_usuario = window.location.pathname.split('/').pop();
        console.log('Token de usuario:', token_usuario); // Asegúrate de que esto esté correcto

        const response = await fetch(`http://74.50.68.87/api/usuarios/nuevopassword/${token_usuario}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contraseña_usuario: password,
                confirmar_contrasena: confirmPassword,
            }),
        });

        console.log('Status de respuesta:', response.status); // Verifica el status de la respuesta

        if (!response.ok) {
            let responseData;
            try {
                responseData = await response.json();
            } catch (err) {
                console.error('Error al parsear JSON:', err);
                throw new Error('Error desconocido al cambiar la contraseña');
            }
            console.error('Error de la API:', responseData);
            throw new Error(responseData.message || 'Error al cambiar la contraseña');
        }

        setSuccess('¡Contraseña cambiada exitosamente! Guarda esta contraseña en un gestor de contraseñas.');
        setPassword('');
        setConfirmPassword('');
    } catch (err) {
        console.error('Error en el envío:', err);
        setError(err.message || 'Ocurrió un error al cambiar la contraseña');
    }
};

  return (
    <div className="new-password-container">
      <div className="new-password-card">
        <div className="new-password-content">
          <div className="icon-container">
            <img src={LogoSaipat} alt="Logo de la Escuela" className="school-logo" />
          </div>

          <h2 className="title">Nueva Contraseña</h2>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} className="form">
            <div className="input-group">
              <label htmlFor="password" className="label">Nueva Contraseña</label>
              <div className="input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword" className="label">Confirmar Nueva Contraseña</label>
              <div className="input-container">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="toggle-password"
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <div className="button-group">
              <button
                type="button"
                onClick={generatePassword}
                className="generate-button"
              >
                <RefreshCw className="icon" style={{ marginRight: '0.5rem' }} />
                Generar Contraseña
              </button>
              <button type="submit" className="submit-button">Cambiar Contraseña</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewPasswordPage;
