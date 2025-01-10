import React, { useState } from 'react';
import { Eye, EyeOff, RefreshCw, Copy, Check } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PreRegisterForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    primerNombre: '',
    primerApellido: '',
    identificador: '',
    contraseña_usuario: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [copied, setCopied] = useState(false);

  // Password strength indicator colors
  const strengthColors = {
    débil: '#ff4d4d',
    media: '#ffd700',
    fuerte: '#00cc00'
  };

  const handleNameInput = (e, field) => {
    const value = e.target.value.toUpperCase().replace(/[^A-ZÁÉÍÓÚÑñ\s]/gi, '');
    setFormData({ ...formData, [field]: value });
  };

  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const checkPasswordStrength = (password) => {
    const strongRegex = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})');
    const mediumRegex = new RegExp('^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})');

    if (strongRegex.test(password)) {
      setPasswordStrength('fuerte');
    } else if (mediumRegex.test(password)) {
      setPasswordStrength('media');
    } else {
      setPasswordStrength('débil');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formData.contraseña_usuario);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      Swal.fire({
        icon: 'success',
        title: '¡Copiado!',
        text: 'Contraseña copiada al portapapeles',
        showConfirmButton: false,
        timer: 1500,
        position: 'top-end',
        toast: true
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo copiar al portapapeles',
        showConfirmButton: false,
        timer: 1500,
        position: 'top-end',
        toast: true
      });
    }
  };

  const generatePassword = () => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    checkPasswordStrength(password);
    setFormData(prev => ({
      ...prev,
      contraseña_usuario: password,
      confirmPassword: password
    }));

    Swal.fire({
      icon: 'success',
      title: '¡Contraseña Generada!',
      text: 'Se ha generado una nueva contraseña segura',
      showConfirmButton: false,
      timer: 1500,
      position: 'top-end',
      toast: true
    });
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.primerNombre) newErrors.primerNombre = 'Primer nombre es requerido';
      if (!formData.primerApellido) newErrors.primerApellido = 'Primer apellido es requerido';
      if (!formData.identificador) newErrors.identificador = 'Correo es requerido';
      else if (!isEmailValid(formData.identificador)) newErrors.identificador = 'Correo no válido';
    } else if (step === 2) {
      if (!formData.contraseña_usuario) newErrors.contraseña_usuario = 'Contraseña es requerida';
      else if (formData.contraseña_usuario.length < 6) newErrors.contraseña_usuario = 'La contraseña debe tener al menos 6 caracteres';
      if (formData.contraseña_usuario !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    try {
      const response = await axios.post('http://74.50.68.87/api/usuarios/pre-registrar-padre', {
        primer_nombre: formData.primerNombre,
        primer_apellido: formData.primerApellido,
        correo_usuario: formData.identificador,
        contraseña_usuario: formData.contraseña_usuario,
        confirmar_contraseña: formData.confirmPassword,
        Primer_ingreso: true
      });

      Swal.fire({
        icon: 'success',
        title: '¡Registro Exitoso!',
        text: 'Por favor, revisa tu correo electrónico para confirmar.',
        confirmButtonColor: '#4f46e5'
      });

      navigate(`/confirmacion-email/${formData.identificador}`);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.mensaje || 'Error al registrar el usuario.',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  return (
    <div className="form-container">
      <div className="form-card">
        <div className="form-header">
          <div className="step-indicator">
            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1</div>
            <div className="step-line"></div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2</div>
          </div>
          <h1>Pre-Registro</h1>
          <p>Registro para Padres de Familia o Tutores</p>
        </div>

        <form onSubmit={handleSubmit} className="multi-step-form">
          {currentStep === 1 && (
            <div className="form-step">
              <div className="input-group">
                <label>Primer Nombre*</label>
                <input
                  type="text"
                  value={formData.primerNombre}
                  onChange={(e) => handleNameInput(e, 'primerNombre')}
                  className={errors.primerNombre ? 'error' : ''}
                  placeholder="NOMBRE"
                />
                {errors.primerNombre && <span className="error-message">{errors.primerNombre}</span>}
              </div>

              <div className="input-group">
                <label>Primer Apellido*</label>
                <input
                  type="text"
                  value={formData.primerApellido}
                  onChange={(e) => handleNameInput(e, 'primerApellido')}
                  className={errors.primerApellido ? 'error' : ''}
                  placeholder="APELLIDO"
                />
                {errors.primerApellido && <span className="error-message">{errors.primerApellido}</span>}
              </div>

              <div className="input-group">
                <label>Correo Electrónico*</label>
                <input
                  type="email"
                  value={formData.identificador}
                  onChange={(e) => setFormData({...formData, identificador: e.target.value})}
                  className={errors.identificador ? 'error' : ''}
                  placeholder="ejemplo@correo.com"
                />
                {errors.identificador && <span className="error-message">{errors.identificador}</span>}
              </div>

              <button type="button" onClick={nextStep} className="next-button">
                Siguiente
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="form-step">
              <div className="password-section">
                <div className="password-generator">
                  <button type="button" onClick={generatePassword} className="generate-button">
                    <RefreshCw size={16} /> Generar Contraseña
                  </button>
                  {formData.contraseña_usuario && (
                    <div className="generated-password">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.contraseña_usuario}
                        readOnly
                      />
                      <button type="button" onClick={copyToClipboard} className="copy-button">
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                  )}
                </div>

                <div className="input-group">
                  <label>Contraseña:‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ </label>
                  <div className="password-input">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.contraseña_usuario}
                      onChange={(e) => {
                        setFormData({...formData, contraseña_usuario: e.target.value});
                        checkPasswordStrength(e.target.value);
                      }}
                      className={errors.contraseña_usuario ? 'error' : ''}
                      placeholder="Contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="toggle-password"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordStrength && (
                    <div className="password-strength">
                      <div 
                        className="strength-bar"
                        style={{
                          width: passwordStrength === 'débil' ? '33%' : 
                                passwordStrength === 'media' ? '66%' : '100%',
                          backgroundColor: strengthColors[passwordStrength]
                        }}
                      ></div>
                      <span>{passwordStrength.toUpperCase()}</span>
                    </div>
                  )}
                  {errors.contraseña_usuario && <span className="error-message">{errors.contraseña_usuario}</span>}
                </div>

                <div className="input-group">
                  <label>Confirmar Contraseña:‎ ‎ ‎ ‎ </label>
                  <div className="password-input">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className={errors.confirmPassword ? 'error' : ''}
                      placeholder="Confirma tu contraseña"
                    />
                  </div>
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>
              </div>

              <div className="button-group">
                <button type="button" onClick={prevStep} className="prev-button">
                  Atrás
                </button>
                <button type="submit" className="submit-button">
                  Registrar
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      <style>{`
        .form-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #f6f7ff 0%, #f0f3ff 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2px;
          font-family: 'Inter', sans-serif;
        }

        .form-card {
          background: white;
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          padding: 40px;
          width: 100%;
          max-width: 600px;
          transform: translateY(0);
          transition: transform 0.3s ease;
        }

        .form-card:hover {
          transform: translateY(-5px);
        }

        .form-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .form-header h1 {
          font-size: 32px;
          color: #1a1a1a;
          margin: 0 0 8px;
          font-weight: 700;
        }

        .form-header p {
          color: #666;
          margin: 0;
        }

        .step-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
        }

        .step {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #e0e0e0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .step.active {
          background: #4f46e5;
          color: white;
        }

        .step-line {
          height: 2px;
          width: 100px;
          background: #e0e0e0;
          margin: 0 16px;
        }

        .input-group {
          margin-bottom: 30px;
        }

        .input-group label {
          display: block;
          margin-bottom: 8px;
          color: #1a1a1a;
          font-weight: 500;
        }

        .input-group input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          font-size: 16px;
          transition: all 0.3s ease;
          outline: none;
        }

        .input-group input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
        }

        .input-group input.error {
          border-color: #ff4d4d;
          background-color: #fff5f5;
        }

        .error-message {
          color: #ff4d4d;
          font-size: 14px;
          margin-top: 4px;
          display: block;
          animation: slideIn 0.3s ease;
        }

        .password-section {
          background: #f8fafc;
          padding: 24px;
          border-radius: 16px;
          margin-bottom: 24px;
          border: 2px solid #e0e0e0;
        }

        .password-generator {
          margin-bottom: 24px;
        }

        .generate-button {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .generate-button:hover {
          background: #4338ca;
          transform: translateY(-2px);
        }

        .generate-button:active {
          transform: translateY(0);
        }

        .generated-password {
          margin-top: 16px;
          display: flex;
          gap: 8px;
        }

        .generated-password input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          font-family: monospace;
          font-size: 16px;
          background: white;
        }

        .copy-button {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .copy-button:hover {
          background: #4338ca;
          transform: scale(1.05);
        }

        .password-input {
          position: relative;
        }

        .toggle-password {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
        }

        .password-strength {
          margin-top: 8px;
          background: #f1f1f1;
          border-radius: 8px;
          overflow: hidden;
        }

        .strength-bar {
          height: 4px;
          transition: all 0.3s ease;
        }

        .password-strength span {
          display: block;
          text-align: center;
          font-size: 12px;
          margin-top: 4px;
          color: #666;
        }

        .button-group {
          display: flex;
          gap: 16px;
          margin-top: 32px;
        }

        .prev-button,
        .next-button,
        .submit-button {
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
        }

        .prev-button {
          background: #f1f1f1;
          border: none;
          color: #666;
        }

        .prev-button:hover {
          background: #e0e0e0;
        }

        .next-button,
        .submit-button {
          background: #4f46e5;
          border: none;
          color: white;
        }

        .next-button:hover,
        .submit-button:hover {
          background: #4338ca;
          transform: translateY(-2px);
        }

        .next-button:active,
        .submit-button:active {
          transform: translateY(0);
        }

        /* Animations */
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .form-step {
          animation: fadeIn 0.3s ease;
        }

        /* Responsive Design */
        @media (max-width: 640px) {
          .form-card {
            padding: 24px;
          }

          .step-line {
            width: 60px;
          }

          .button-group {
            flex-direction: column;
          }

          .prev-button,
          .next-button,
          .submit-button {
            width: 100%;
          }
        }

        /* Loading Animation */
        .loading {
          position: relative;
        }

        .loading::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
        }

        /* Toast Animation */
        .swal2-popup {
          animation: swal2-show 0.3s;
        }

        .swal2-toast {
          background: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-radius: 12px;
        }

        /* Additional Hover Effects */
        .input-group input:hover {
          border-color: #6366f1;
        }

        .toggle-password:hover {
          color: #4f46e5;
        }

        /* Focus States */
        button:focus-visible,
        input:focus-visible {
          outline: 2px solid #4f46e5;
          outline-offset: 2px;
        }

        /* Disabled States */
        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Success States */
        input.success {
          border-color: #10b981;
        }

        /* Card Hover Effect */
        .form-card {
          position: relative;
        }

        .form-card::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 24px;
          pointer-events: none;
          transition: all 0.3s ease;
          z-index: -1;
        }

        .form-card:hover::after {
          box-shadow: 0 20px 60px rgba(79, 70, 229, 0.1);
        }
      `}</style>
    </div>
  );
};

export default PreRegisterForm;