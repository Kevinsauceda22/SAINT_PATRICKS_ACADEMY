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

    toast.info('Contraseña generada con éxito', {
      position: 'top-center',
      autoClose: 5000
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

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
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Pre-Registro</h1>
        <p className="text-gray-600">Registro para Padres de Familia o Tutores</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Primer Nombre*</label>
            <input
              type="text"
              value={formData.primerNombre}
              onChange={(e) => handleNameInput(e, 'primerNombre')}
              className={`mt-1 block w-full rounded-md border ${errors.primerNombre ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm`}
              placeholder="NOMBRE"
              aria-invalid={errors.primerNombre ? 'true' : 'false'}
            />
            {errors.primerNombre && <span className="text-sm text-red-500">{errors.primerNombre}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Primer Apellido*</label>
            <input
              type="text"
              value={formData.primerApellido}
              onChange={(e) => handleNameInput(e, 'primerApellido')}
              className={`mt-1 block w-full rounded-md border ${errors.primerApellido ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm`}
              placeholder="APELLIDO"
              aria-invalid={errors.primerApellido ? 'true' : 'false'}
            />
            {errors.primerApellido && <span className="text-sm text-red-500">{errors.primerApellido}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Correo Electrónico*</label>
            <input
              type="email"
              value={formData.identificador}
              onChange={(e) => setFormData({...formData, identificador: e.target.value})}
              className={`mt-1 block w-full rounded-md border ${errors.identificador ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm`}
              placeholder="ejemplo@correo.com"
              aria-invalid={errors.identificador ? 'true' : 'false'}
            />
            {errors.identificador && <span className="text-sm text-red-500">{errors.identificador}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña*</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.contraseña_usuario}
                onChange={(e) => {
                  setFormData({...formData, contraseña_usuario: e.target.value});
                  checkPasswordStrength(e.target.value);
                }}
                className={`mt-1 block w-full rounded-md border ${errors.contraseña_usuario ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm`}
                placeholder="Contraseña"
                aria-invalid={errors.contraseña_usuario ? 'true' : 'false'}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3">
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.contraseña_usuario && <span className="text-sm text-red-500">{errors.contraseña_usuario}</span>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña*</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className={`mt-1 block w-full rounded-md border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} px-3 py-2 text-sm`}
              placeholder="Confirma tu contraseña"
              aria-invalid={errors.confirmPassword ? 'true' : 'false'}
            />
            {errors.confirmPassword && <span className="text-sm text-red-500">{errors.confirmPassword}</span>}
          </div>
        </div>

        <div className="flex justify-between">
          <button type="button" onClick={generatePassword} className="bg-blue-600 text-white px-4 py-2 rounded-md">Generar Contraseña</button>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md">Registrar</button>
        </div>
      </form>

      <ToastContainer />
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
