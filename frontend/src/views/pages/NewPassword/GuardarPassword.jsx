import React, { useState, useContext } from 'react';

import axios from 'axios';

import { Key, Eye, EyeOff, Copy, Wand2, Check } from 'lucide-react';
import './ChangePassword.css';
import Swal from 'sweetalert2';
import AuthContext from '.././../../../context/AuthProvider';
import { useNavigate } from 'react-router-dom';

const ChangePassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showGenerateAlert, setShowGenerateAlert] = useState(false);
    const [showCopyAlert, setShowCopyAlert] = useState(false);
    const { auth, setAuth } = useContext(AuthContext);
    const navigate = useNavigate();
  
    const handlePasswordChange = (e) => {
      setPassword(e.target.value);
      setErrorMessage('');
    };
  
    const handleConfirmPasswordChange = (e) => {
      setConfirmPassword(e.target.value);
      setErrorMessage('');
    };
  
    const generatePassword = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
      let generatedPassword = '';
      for (let i = 0; i < 12; i++) {
        generatedPassword += chars[Math.floor(Math.random() * chars.length)];
      }
      setPassword(generatedPassword);
      setConfirmPassword(generatedPassword);
      setErrorMessage('');
      setShowGenerateAlert(true);
      setTimeout(() => setShowGenerateAlert(false), 3000);
    };
  
    const copyPassword = () => {
      navigator.clipboard.writeText(password);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 3000);
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      // Validaciones
      if (password !== confirmPassword) {
        setErrorMessage('Las contraseñas no coinciden');
        return;
      }
      if (password.includes(' ')) {
        setErrorMessage('La contraseña no debe contener espacios');
        return;
      }
      if (password.length < 8) {
        setErrorMessage('La contraseña debe tener al menos 8 caracteres');
        return;
      }
  
      try {
        const token = localStorage.getItem('token');
        const response = await axios.put(
          'http://74.50.68.87:4000/api/usuarios/actualizar-password-temporal',
          {
            cod_usuario: auth.cod_usuario,
            nueva_contraseña: password
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
  
        if (response.data.status) {
          // Actualizar el estado de auth
          setAuth(prevAuth => ({
            ...prevAuth,
            password_temporal: 0
          }));
  
          // Mostrar alerta de éxito
          await Swal.fire({
            title: '¡Éxito!',
            text: 'Haz actualizado tus credenciales correctamente, usarás esta contraseña para poder ingresar al sistema',
            icon: 'success',
            confirmButtonText: 'Entendido',
            customClass: {
              popup: 'swal2-popup-custom',
              confirmButton: 'swal2-confirm-custom'
            }
          });
  
          // Redirigir al dashboard
          navigate('/');
        }
      } catch (error) {
        console.error('Error al actualizar la contraseña:', error);
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.mensaje || 'Error al actualizar la contraseña',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    };
  return (
    <div className="change-password-wrapper">
      <div className="change-password-container">
        <div className="logo-wrapper">
          <img 
            src="https://i.ibb.co/58kBnCh/Logo.png"
            alt="Logo Escuela" 
            className="school-logo"
          />
        </div>

        <div className="password-header">
          <h2 className="password-title">Cambiar Contraseña Temporal</h2>
          <p className="password-description">
            Estás a punto de cambiar tu contraseña temporal por una contraseña propia.
            Asegúrate de elegir una contraseña segura y fácil de recordar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="password-form">
          <div className="password-form-group">
            <label htmlFor="password" className="password-label">
              Nueva Contraseña
            </label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={handlePasswordChange}
                className="password-input-field"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-password-btn"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="password-actions">
              <button
                type="button"
                onClick={generatePassword}
                className="password-action-btn"
              >
                <Wand2 size={16} />
                Generar
              </button>
              <button
                type="button"
                onClick={copyPassword}
                className="password-action-btn"
              >
                <Copy size={16} />
                Copiar
              </button>
            </div>
          </div>

          <div className="password-form-group">
            <label htmlFor="confirmPassword" className="password-label">
              Confirmar Contraseña
            </label>
            <div className="input-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                className="password-input-field"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="toggle-password-btn"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="password-error">
              {errorMessage}
            </div>
          )}

          {showGenerateAlert && (
            <div className="password-alert alert-success">
              <Check size={16} />
              <span>Contraseña generada exitosamente</span>
            </div>
          )}

          {showCopyAlert && (
            <div className="password-alert alert-info">
              <Check size={16} />
              <span>Contraseña copiada al portapapeles</span>
            </div>
          )}

          <button type="submit" className="submit-password-btn">
            <Key size={20} />
            Cambiar Contraseña
          </button>
        </form>

        <p className="password-help">
          Si tienes algún problema al cambiar tu contraseña, por favor comunícate con un administrador.
        </p>
      </div>
    </div>
  );
};

export default ChangePassword;