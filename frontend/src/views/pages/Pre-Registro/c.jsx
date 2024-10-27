import React, { useState } from 'react';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Pre-registro.css';

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

  // Función para convertir a mayúsculas y validar solo letras
  const handleNameInput = (e, field) => {
    const value = e.target.value.toUpperCase()
      .replace(/[^A-ZÁÉÍÓÚÑñ\s]/gi, '');
    
    setFormData({ ...formData, [field]: value });
  };

  // Generador de contraseña segura
  const generatePassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let all = lowercase + uppercase + numbers + symbols;
    let password = '';
    
    // Asegurar al menos uno de cada tipo
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Completar hasta 12 caracteres
    for(let i = password.length; i < 12; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }
    
    // Mezclar la contraseña
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    setGeneratedPassword(password);
    setShowGeneratedPassword(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validaciones
    if (!formData.primerNombre) newErrors.primerNombre = 'Primer nombre es requerido';
    if (!formData.primerApellido) newErrors.primerApellido = 'Primer apellido es requerido';
    if (!formData.identificador) newErrors.identificador = 'Correo es requerido';
    else if (!isEmailValid(formData.identificador)) newErrors.identificador = 'Correo no válido';
    if (!formData.contraseña_usuario) newErrors.contraseña_usuario = 'Contraseña es requerida';
    else if (formData.contraseña_usuario.length < 6) newErrors.contraseña_usuario = 'La contraseña debe tener al menos 6 caracteres';
    if (formData.contraseña_usuario !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await axios.post('http://localhost:4000/api/usuarios/pre-registrar-padre', {
          primer_nombre: formData.primerNombre,
          primer_apellido: formData.primerApellido,
          correo_usuario: formData.identificador,
          contraseña_usuario: formData.contraseña_usuario,
          confirmar_contraseña: formData.confirmPassword,
          Primer_ingreso: true
        });

        toast.success('Registro exitoso. Por favor, revisa tu correo electrónico para confirmar.', {
          position: 'top-right',
          autoClose: 5000
        });

        navigate(`/confirmacion-email/${formData.identificador}`);
      } catch (error) {
        console.error(error); // Loguea el error completo para depuración
        toast.error(error.response?.data?.mensaje || 'Error al registrar el usuario.', {
          position: 'top-right',
          autoClose: 5000
        });
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <div style={styles.logo}></div>
            <h1 style={styles.title}>Pre-Registro</h1>
          </div>
          <p style={styles.subtitle}>Registro para Padres de Familia o Tutores</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Primer Nombre*</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleNameInput(e, 'firstName')}
              style={{...styles.input, ...(errors.firstName ? styles.inputError : {})}}
              placeholder="NOMBRE"
            />
            {errors.firstName && <span style={styles.error}>{errors.firstName}</span>}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Primer Apellido*</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleNameInput(e, 'lastName')}
              style={{...styles.input, ...(errors.lastName ? styles.inputError : {})}}
              placeholder="APELLIDO"
            />
            {errors.lastName && <span style={styles.error}>{errors.lastName}</span>}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Correo Electrónico*</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{...styles.input, ...(errors.email ? styles.inputError : {})}}
              placeholder="ejemplo@correo.com"
            />
            {errors.email && <span style={styles.error}>{errors.email}</span>}
          </div>

          <div style={styles.passwordSection}>
            <div style={styles.passwordHeader}>
              <h3 style={styles.passwordTitle}>Contraseña</h3>
              <button
                type="button"
                onClick={generatePassword}
                style={styles.generateButton}
              >
                Generar Contraseña Segura
              </button>
            </div>

            {showGeneratedPassword && (
              <div style={styles.generatedPasswordContainer}>
                <p style={styles.generatedPasswordTitle}>Contraseña Generada:</p>
                <div style={styles.generatedPasswordBox}>
                  <span style={styles.generatedPasswordText}>{generatedPassword}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPassword);
                      setFormData({...formData, password: generatedPassword, confirmPassword: generatedPassword});
                    }}
                    style={styles.copyButton}
                  >
                    Copiar y Usar
                  </button>
                </div>
              </div>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Contraseña*</label>
              <div style={styles.passwordInput}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  style={{...styles.input, ...(errors.password ? styles.inputError : {})}}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.showPasswordButton}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {errors.password && <span style={styles.error}>{errors.password}</span>}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirmar Contraseña*</label>
              <input
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                style={{...styles.input, ...(errors.confirmPassword ? styles.inputError : {})}}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <span style={styles.error}>{errors.confirmPassword}</span>}
            </div>
          </div>

          <button type="submit" style={styles.submitButton}>
            Completar Pre-Registro
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
    padding: '40px',
    width: '100%',
    maxWidth: '600px',
  },
  header: {
    marginBottom: '40px',
    textAlign: 'center',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginBottom: '16px',
  },
  logo: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#475569',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    fontSize: '16px',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  error: {
    fontSize: '14px',
    color: '#ef4444',
  },
  passwordSection: {
    backgroundColor: '#f8fafc',
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
  },
  passwordHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  passwordTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    margin: 0,
  },
  generateButton: {
    padding: '8px 16px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  generatedPasswordContainer: {
    backgroundColor: 'white',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '20px',
    border: '1px solid #e2e8f0',
  },
  generatedPasswordTitle: {
    fontSize: '14px',
    color: '#475569',
    margin: '0 0 8px 0',
  },
  generatedPasswordBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: '12px',
    borderRadius: '8px',
  },
  generatedPasswordText: {
    fontSize: '16px',
    color: '#1e293b',
    fontFamily: 'monospace',
  },
  copyButton: {
    padding: '6px 12px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  passwordInput: {
    position: 'relative',
    display: 'flex',
  },
  showPasswordButton: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#4f46e5',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  submitButton: {
    padding: '16px 24px',
    backgroundColor: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '16px',
  },
};

export default PreRegisterForm;