import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, User, Lock } from 'lucide-react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from 'src/assets/brand/logo_saint_patrick.png'
import * as jwt_decode from 'jwt-decode'; // Corregida la importación


const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [formData, setFormData] = useState({
    
    identificador: '',
    contraseña_usuario: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = '/dashboard';
    }
  }, []);

  const handleTransition = async (path) => {
    setIsFading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    navigate(path);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.identificador) {
      newErrors.identificador = 'Identificador es requerido';
    }
    if (!formData.contraseña_usuario) {
      newErrors.contraseña_usuario = 'Contraseña es requerida';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const response = await axios.post('http://localhost:4000/api/usuarios/login', {
          identificador: formData.identificador,
          contraseña_usuario: formData.contraseña_usuario,
          twoFactorCode: formData.twoFactorCode
        });

        console.log('Respuesta completa del login:', response.data);

        if (response.data.token) {
          // Guardar token y datos del usuario
          localStorage.setItem('token', response.data.token);
          
          // Decodificar el token para obtener el cod_usuario
          const decodedToken = jwt_decode.jwtDecode(response.data.token);
          console.log('Token decodificado:', decodedToken);

          // Registrar en bitácora
          try {
            // Asumiendo que el cod_usuario está en el token
            if (!decodedToken.cod_usuario) {
              console.error('Token decodificado:', decodedToken);
              throw new Error('No se pudo obtener el código de usuario del token');
            }

            // Intentar registro en bitácora
            await axios.post('http://localhost:4000/api/bitacora/registro', {
              cod_usuario: decodedToken.cod_usuario,
              cod_objeto: 76,
              accion: 'LOGIN',
              descripcion: `Inicio de sesión exitoso del usuario: ${formData.identificador}`
            }, {
              headers: {
                'Authorization': `Bearer ${response.data.token}`
              }
            });

            console.log('Registro en bitácora exitoso');
          } catch (bitacoraError) {
            console.error('Error al registrar en bitácora:', bitacoraError);
            console.error('Token decodificado:', decodedToken);
          }

          const isTwoFactorEnabled = response.data.is_two_factor_enabled === 1;
          console.log('Estado 2FA:', isTwoFactorEnabled);

          if (isTwoFactorEnabled) {
            localStorage.setItem('temp_identificador', formData.identificador);
            await handleTransition('/2fa');
          } else {
            await handleTransition('/dashboard');
            if (response.data.is_two_factor_enabled === 1) {
              toast.info('Tu cuenta tiene autenticación de dos factores activada. Puedes configurarla en tu perfil.', {
                position: 'top-right',
                autoClose: 5000,
              });
            }
          }
        }
      } catch (error) {
        console.error('Error en el login:', error);
        toast.error(error.response?.data?.mensaje || 'Error en el inicio de sesión', {
          position: 'top-center',
          autoClose: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    }
};
  const styles = {
    container: {
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
    },
    leftPanel: {
      flex: window.innerWidth <= 768 ? 'none' : '1',
      background: 'linear-gradient(135deg, #bdecb6 0%, #a3d5a5 50%, #82c5a1 100%)', // Degradado de verdes
      display: window.innerWidth <= 768 ? 'none' : 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: window.innerWidth <= 768 ? '20px' : '40px',
      color: '#065f46',
    },
    leftContent: {
      maxWidth: '440px',
      textAlign: 'center',
      padding: window.innerWidth <= 768 ? '20px' : '0',
    },
    welcomeText: {
      fontSize: window.innerWidth <= 768 ? '28px' : '36px',
      fontWeight: '700',
      marginBottom: '16px',
    },
    welcomeDesc: {
      fontSize: window.innerWidth <= 768 ? '16px' : '18px',
      opacity: '0.9',
      marginBottom: window.innerWidth <= 768 ? '20px' : '40px',
    },
    illustration: {
      position: 'relative',
      height: window.innerWidth <= 768 ? '200px' : '300px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    rightPanel: {
      flex: window.innerWidth <= 768 ? 'auto' : '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: window.innerWidth <= 768 ? '20px' : '40px',
      minHeight: window.innerWidth <= 768 ? '100vh' : 'auto',
    },
    loginContainer: {
      width: '100%',
      maxWidth: window.innerWidth <= 768 ? '100%' : '440px',
      padding: window.innerWidth <= 768 ? '20px' : '40px',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      margintop: "24px",
      marginBottom: window.innerWidth <= 768 ? '10px' : '10px',
    },
    logoCircle: {
      width: window.innerWidth <= 768 ? '100px' : '150px',
      height: window.innerWidth <= 768 ? '100px' : '150px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '50%',
      overflow: 'hidden',
      background: `url(${logo}) no-repeat center center`,
      backgroundSize: 'cover',
    },
    title: {
      fontSize: window.innerWidth <= 768 ? '24px' : '32px',
      fontWeight: '100',
      color: '#1e293b',
      marginBottom: '32px',
      textAlign: 'center',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: window.innerWidth <= 768 ? '16px' : '24px',
      width: '100%',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      position: 'relative',
      width: '100%',
    },
    label: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#475569',
    },
    input: {
      padding: '12px 16px 12px 40px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      fontSize: window.innerWidth <= 768 ? '14px' : '16px',
      transition: 'all 0.2s ease',
      outline: 'none',
      width: '100%',
      boxSizing: 'border-box',
    },
    inputIcon: {
      position: 'absolute',
      left: '12px',
      top: '38px',
      color: '#94a3b8',
    },
    showPasswordButton: {
      position: 'absolute',
      right: '12px',
      top: '38px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#94a3b8',
      padding: '0',
    },
    error: {
      color: '#ef4444',
      fontSize: '12px',
      marginTop: '4px',
    },
    forgotPassword: {
      fontSize: '14px',
      color: '#4f46e5',
      textDecoration: 'none',
      alignSelf: 'flex-end',
      cursor: 'pointer',
    },
    loginButton: {
      padding: window.innerWidth <= 768 ? '12px 20px' : '14px 24px',
      backgroundColor: '#8add7b',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: window.innerWidth <= 768 ? '14px' : '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 14px rgba(79, 70, 229, 0.15)',
      width: '100%',
      marginTop: window.innerWidth <= 768 ? '16px' : '24px',
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      margin: window.innerWidth <= 768 ? '20px 0' : '32px 0',
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      backgroundColor: '#e2e8f0',
    },
    dividerText: {
      padding: '0 16px',
      color: '#94a3b8',
      fontSize: '14px',
    },
    registerContainer: {
      textAlign: 'center',
      backgroundColor: '#f8fafc',
      padding: window.innerWidth <= 768 ? '16px' : '24px',
      borderRadius: '16px',
      border: '2px dashed #e2e8f0',
    },
    registerText: {
      fontSize: window.innerWidth <= 768 ? '14px' : '16px',
      color: '#475569',
      marginBottom: window.innerWidth <= 768 ? '12px' : '16px',
    },
    registerButton: {
      padding: window.innerWidth <= 768 ? '10px 20px' : '12px 24px',
      backgroundColor: '#8add7b',
      color: 'white',
      border: '2px solid #8add7b',
      borderRadius: '12px',
      fontSize: window.innerWidth <= 768 ? '14px' : '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textDecoration: 'none',
      display: 'inline-block',
    }
  };

  // Agregamos un efecto para manejar los cambios de tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      // Forzar una actualización del componente
      setIsFading(prev => !prev); // Esto forzará un re-render
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <h1 style={styles.welcomeText}>Saint Patrick´s Academy</h1>
          <p style={styles.welcomeDesc}>
            
Superación, Integridad y Amor. Principios y valores que sentan la base de la educación que impartimos en Saint Patrick's Academy a nuestro alumnos.
          </p>
          <div style={styles.illustration}>
            <div style={styles.illustrationCircle}></div>
            <div style={styles.illustrationSquare}></div>
          </div>
        </div>
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.loginContainer}>
          <div style={styles.logo}>
            <div style={styles.logoCircle}></div>
          </div>

          <h2 style={styles.title}>Iniciar Sesión</h2>

          <form style={styles.form} onSubmit={handleLoginSubmit}>
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="identificador">
                Correo o Usuario
              </label>
              <div style={styles.inputIcon}>
                <User size={window.innerWidth <= 768 ? 16 : 20} />
              </div>
              <input
                id="identificador"
                name="identificador"
                type="text"
                required
                style={styles.input}
                placeholder="nombre@ejemplo.com"
                onChange={handleChange}
                onFocus={(e) => {
                  e.target.style.borderColor = '#8add7b';
                  e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.identificador && (
                <p style={styles.error}>{errors.identificador}</p>
              )}
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="password">
                Contraseña
              </label>
              <div style={styles.inputIcon}>
                <Lock size={window.innerWidth <= 768 ? 16 : 20} />
              </div>
              <input
                id="password"
                name="contraseña_usuario"
                type={showPassword ? 'text' : 'password'}
                required
                style={styles.input}
                placeholder="••••••••"
                onChange={handleChange}
                onFocus={(e) => {
                  e.target.style.borderColor = '#8add7b';
                  e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.showPasswordButton}
              >
                {showPassword ? 
                  <EyeOff size={window.innerWidth <= 768 ? 16 : 20} /> : 
                  <Eye size={window.innerWidth <= 768 ? 16 : 20} />
                }
              </button>
              {errors.contraseña_usuario && (
                <p style={styles.error}>{errors.contraseña_usuario}</p>
              )}
            </div>

            <Link 
              to="/Olvidecontraseña" 
              style={styles.forgotPassword}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
              ¿Olvidaste tu contraseña?
            </Link>

            <button
              type="submit"
              style={styles.loginButton}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#8add7b';
                e.target.style.transform = window.innerWidth <= 768 ? 'none' : 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(79, 70, 229, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#8add7b';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 14px rgba(79, 70, 229, 0.15)';
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>

            <div style={styles.divider}>
              <div style={styles.dividerLine}></div>
              <span style={styles.dividerText}>O</span>
              <div style={styles.dividerLine}></div>
            </div>

            <div style={styles.registerContainer}>
              <p style={styles.registerText}>¿Aún no tienes una cuenta?</p>
              <Link
                to="/pre-Registro"
                style={styles.registerButton}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#8add7b';
                  e.target.style.color = 'white';
                  e.target.style.transform = window.innerWidth <= 768 ? 'none' : 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#8add7b';
                  e.target.style.color = 'white';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Regístrate ahora
              </Link>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer 
        position={window.innerWidth <= 768 ? "bottom-center" : "top-right"}
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default Login;