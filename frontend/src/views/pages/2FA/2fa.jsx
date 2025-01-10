import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../../../context/AuthProvider'; // Ajusta la ruta según tu estructura

const Auth2FA = () => {
  const [twoFACode, setTwoFACode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);

  useEffect(() => {
    // Verificar si el usuario está autenticado y necesita 2FA
    if (!auth || auth.is_two_factor_enabled !== 1) {
      navigate('/login');
      return;
    }

    // Si el usuario ya completó 2FA, redirigir según su estado
    if (auth.two_factor_verified) {
      handleRedirectBasedOnState(auth.cod_estado_usuario);
    }
  }, [auth, navigate]);

  const handleRedirectBasedOnState = (codEstadoUsuario) => {
    switch (codEstadoUsuario) {
      case 1: // Activo
        navigate('/dashboard');
        break;
      case 2: // Cuenta en revisión
        navigate('/CuentaenRevision');
        break;
      case 3: // Cuenta suspendida
        navigate('/CuentaSuspendida');
        break;
      default:
        setError('Estado de usuario desconocido');
        break;
    }
  };

  const handleInputChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) {
      value = value.slice(0, 3) + '-' + value.slice(3, 6);
    }
    setTwoFACode(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No hay sesión activa');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://74.50.68.87/api/usuarios/verifyTwoFactorAuthCode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          twoFactorCode: twoFACode.replace(/-/g, ''),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al verificar el código');
      }

      setIsSuccess(true);

      // Actualizar el estado de auth para reflejar que 2FA está verificado
      if (auth) {
        setAuth({
          ...auth,
          otp_verified: true
        });
      }

      // Redirigir al dashboard tras un breve retraso para mostrar el mensaje de éxito
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000); // Esperar 2 segundos antes de redirigir

    } catch (err) {
      console.error('Error en verificación 2FA:', err);
      setError(err.message || 'Error al verificar el código. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
          .auth-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 20px;
          }

          .auth-card {
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
            padding: 2rem;
            position: relative;
            transform: translateY(0);
            transition: transform 0.3s ease;
          }

          .auth-card:hover {
            transform: translateY(-5px);
          }

          .auth-title {
            color: #1a1a1a;
            font-size: 1.75rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
            text-align: center;
          }

          .auth-subtitle {
            color: #666;
            font-size: 0.875rem;
            text-align: center;
            margin-bottom: 2rem;
            line-height: 1.5;
          }

          .input-group {
            position: relative;
            margin-bottom: 1.5rem;
          }

          .auth-input {
            width: 100%;
            padding: 12px 16px;
            font-size: 1.25rem;
            border: 2px solid #e1e1e1;
            border-radius: 8px;
            outline: none;
            transition: all 0.3s ease;
            text-align: center;
            letter-spacing: 2px;
          }

          .auth-input:focus {
            border-color: #4f46e5;
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
          }

          .auth-input::placeholder {
            color: #a0a0a0;
            letter-spacing: normal;
          }

          .auth-button {
            width: 100%;
            padding: 12px;
            background: #4f46e5;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }

          .auth-button:hover:not(:disabled) {
            background: #4338ca;
            transform: translateY(-1px);
          }

          .auth-button:disabled {
            background: #a5a5a5;
            cursor: not-allowed;
          }

          .auth-button.loading {
            color: transparent;
          }

          .auth-button.loading::after {
            content: "";
            position: absolute;
            width: 20px;
            height: 20px;
            top: 50%;
            left: 50%;
            margin: -10px 0 0 -10px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .error-message {
            background: #fee2e2;
            color: #dc2626;
            padding: 12px;
            border-radius: 8px;
            margin-top: 1rem;
            font-size: 0.875rem;
            animation: shake 0.5s ease-in-out;
            text-align: center;
          }

          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }

          .success-message {
            background: #dcfce7;
            color: #16a34a;
            padding: 12px;
            border-radius: 8px;
            margin-top: 1rem;
            font-size: 0.875rem;
            animation: slideIn 0.5s ease-in-out;
            text-align: center;
          }

          @keyframes slideIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .input-hint {
            color: #666;
            font-size: 0.75rem;
            margin-top: 0.5rem;
            text-align: center;
          }
        `}
      </style>

      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Verificación de 2FA</h1>
          <p className="auth-subtitle">
            Ingresa el código de 6 dígitos de tu aplicación autenticadora
            <br />
            El código se actualiza cada 30 segundos
          </p>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                className="auth-input"
                value={twoFACode}
                onChange={handleInputChange}
                placeholder="000-000"
                required
                maxLength="7"
                disabled={isLoading || isSuccess}
                autoComplete="one-time-code"
              />
              <p className="input-hint">
                Formato: XXX-XXX
              </p>
            </div>

            <button
              type="submit"
              className={`auth-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading || isSuccess}
            >
              {isLoading ? 'Verificando...' : 'Verificar Código'}
            </button>

            {error && <div className="error-message">{error}</div>}
            {isSuccess && <div className="success-message">Verificación exitosa. Redirigiendo...</div>}
          </form>
        </div>
      </div>
    </>
  );
};

export default Auth2FA;
