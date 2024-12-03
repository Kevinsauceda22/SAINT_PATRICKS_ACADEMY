import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ConfirmacionEmail = () => {
  const { correo } = useParams();
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCargando(false);
    }, 30000000000000000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <div className="email-icon">
          <div className="envelope">
            <div className="envelope-flap"></div>
            <div className="envelope-letter">✓</div>
          </div>
        </div>

        <h2 className="confirmation-title">
          Confirma tu correo electrónico
        </h2>

        <div className="confirmation-content">
          <p className="email-sent-to">
            Hemos enviado un enlace a:<br />
            <strong className="email-highlight">{correo}</strong>
          </p>

          {cargando ? (
            <div className="waiting-confirmation">
              <div className="spinner">
                <div className="spinner-ring"></div>
              </div>
              <p className="waiting-text">
                Esperando confirmación...<br />
                <span className="subtle-text">
                  Puedes cerrar esta pestaña y continuar desde tu correo
                </span>
              </p>
            </div>
          ) : (
            <div className="confirmation-complete">
              <div className="check-mark">✓</div>
              <p className="complete-text">
                Gracias por tu paciencia. Ya puedes iniciar sesión.
              </p>
            </div>
          )}

          <div className="instructions">
            <p className="instruction-title">No recibiste el correo?</p>
            <ul className="instruction-list">
              <li>Revisa tu carpeta de spam</li>
              <li>Verifica que el correo sea correcto</li>
              <li>Espera unos minutos e intenta nuevamente</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .confirmation-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
          padding: 20px;
        }

        .confirmation-card {
          background: white;
          padding: 2.5rem;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
          width: 100%;
          max-width: 500px;
          text-align: center;
        }

        .email-icon {
          margin-bottom: 2rem;
        }

        .envelope {
          position: relative;
          width: 80px;
          height: 60px;
          margin: 0 auto;
        }

        .envelope-flap {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 40px;
          background: #4A90E2;
          clip-path: polygon(0 0, 50% 30px, 100% 0, 100% 100%, 0 100%);
        }

        .envelope-letter {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 1.5rem;
          z-index: 1;
        }

        .confirmation-title {
          color: #2c3e50;
          font-size: 1.75rem;
          margin-bottom: 1.5rem;
        }

        .email-sent-to {
          color: #555;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .email-highlight {
          display: inline-block;
          color: #2c3e50;
          background: #f8f9fa;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          margin-top: 0.5rem;
          border: 2px solid #e9ecef;
        }

        .waiting-confirmation {
          margin: 2rem 0;
        }

        .spinner {
          margin: 0 auto 1.5rem;
          width: 50px;
          height: 50px;
        }

        .spinner-ring {
          width: 100%;
          height: 100%;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4A90E2;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .waiting-text {
          color: #555;
          line-height: 1.6;
        }

        .subtle-text {
          display: block;
          color: #888;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        .confirmation-complete {
          margin: 2rem 0;
        }

        .check-mark {
          width: 50px;
          height: 50px;
          background: #4CAF50;
          border-radius: 50%;
          color: white;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        .complete-text {
          color: #4CAF50;
          font-weight: 500;
        }

        .instructions {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 2px solid #f5f5f5;
        }

        .instruction-title {
          color: #666;
          font-weight: 500;
          margin-bottom: 1rem;
        }

        .instruction-list {
          list-style: none;
          padding: 0;
          margin: 0;
          color: #888;
          font-size: 0.9rem;
          line-height: 1.8;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .confirmation-card {
            padding: 1.5rem;
          }

          .confirmation-title {
            font-size: 1.5rem;
          }

          .email-highlight {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ConfirmacionEmail;