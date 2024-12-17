import React, { useState } from 'react';
import Swal from 'sweetalert2';

const PasswordReset = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');

  const resetPassword = async (e) => {
    e.preventDefault(); // Prevenir el comportamiento predeterminado del formulario
    try {
      const response = await fetch('http://74.50.68.87:4000/api/usuarios/olvide-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo_usuario: email }), // Asegúrate de pasar el email correcto
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.mensaje || 'Error al enviar el correo de restablecimiento');
      }

      // Si la respuesta es exitosa, avanzar al siguiente paso
      setStep(2);
      Swal.fire({
        title: '¡Éxito!',
        text: 'Instrucciones de restablecimiento de contraseña enviadas a tu correo.',
        icon: 'success',
        confirmButtonText: 'Aceptar',
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
        confirmButtonText: 'Aceptar',
      }); // Mostrar mensaje de error al usuario
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <div className="icon-container">
          {/* Icono de candado simple usando CSS */}
          <div className="lock-icon">
            <div className="lock-body"></div>
            <div className="lock-hook"></div>
          </div>
        </div>

        <h1 className="title">
          {step === 1 && "Restablecer Contraseña"}
        </h1>

        <p className="description">
          {step === 1 && "Ingresa tu correo electrónico para recibir instrucciones de restablecimiento."}
          {step === 2 && "Las instrucciones han sido enviadas a tu correo."}
        </p>

        <div className="form-container">
          {step === 1 && (
            <form onSubmit={resetPassword} className="reset-form">
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
              />
              <button type="submit" className="submit-button">
                Enviar Instrucciones
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="success-container">
              <div className="success-icon">✓</div>
              <button 
                onClick={() => window.location.href = '/login'} 
                className="submit-button"
              >
                Ir al Inicio de Sesión
              </button>
            </div>
          )}

          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="back-button"
            >
              Volver atrás
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .reset-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f5f5f5;
          padding: 20px;
        }

        .reset-card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 400px;
          text-align: center;
        }

        .icon-container {
          margin-bottom: 1.5rem;
        }

        .lock-icon {
          display: inline-block;
          position: relative;
          width: 60px;
          height: 60px;
        }

        .lock-body {
          width: 40px;
          height: 30px;
          background: #4A90E2;
          border-radius: 5px;
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
        }

        .lock-hook {
          width: 20px;
          height: 20px;
          border: 6px solid #4A90E2;
          border-radius: 50%;
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          border-bottom: transparent;
        }

        .title {
          color: #333;
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .description {
          color: #666;
          margin-bottom: 2rem;
        }

        .reset-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .input-field {
          padding: 0.75rem 1rem;
          border: 2px solid #e1e1e1;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
          width: 100%;
        }

        .input-field:focus {
          border-color: #4A90E2;
          outline: none;
        }

        .submit-button {
          background-color: #4A90E2;
          color: white;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .submit-button:hover {
          background-color: #357ABD;
        }

        .back-button {
          background: transparent;
          border: none;
          color: #4A90E2;
          cursor: pointer;
          font-size: 0.9rem;
          margin-top: 1rem;
        }

        .success-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 1rem;
        }

        .success-icon {
          font-size: 3rem;
          color: #4A90E2;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

export default PasswordReset;
