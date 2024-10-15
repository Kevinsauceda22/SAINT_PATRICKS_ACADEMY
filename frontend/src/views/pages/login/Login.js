import React, { useState } from 'react';
import './login.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [formData, setFormData] = useState({
    identificador: "",
    contraseña_usuario: "",
    confirmPassword: "",
    dni: "",
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    nacionalidad: "",
    direccion: "",
    fechaNacimiento: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const toggleForm = () => {
    setIsLogin((prev) => !prev);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Manejador para el Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    
    // Validación del login
    if (!formData.identificador) newErrors.identificador = "Identificador es requerido";
    if (!formData.contraseña_usuario) newErrors.contraseña_usuario = "Contraseña es requerida";
    else if (formData.contraseña_usuario.length < 6) newErrors.contraseña_usuario = "La contraseña debe tener al menos 6 caracteres";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await axios.post('http://localhost:4000/api/usuarios/login', {
          identificador: formData.identificador,
          contraseña_usuario: formData.contraseña_usuario,
        });

        toast.success("Inicio de sesión exitoso!", {
          position: "top-right",
          autoClose: 5000,
          style: {
            backgroundColor: '#4bb6b7',
            color: '#ffffff',
            fontWeight: 'bold',
          },
        });

        navigate('/dashboard'); // Redirige al dashboard
      } catch (error) {
        toast.error("Error en el inicio de sesión. Intenta nuevamente.", {
          position: "top-right",
          autoClose: 5000,
          style: {
            backgroundColor: '#ff4d4d',
            color: '#ffffff',
            fontWeight: 'bold',
          },
        });
      }
    }
  };

  // Manejador para el Pre-Registro
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    // Validación del pre-registro
    if (!formData.primerNombre) newErrors.primerNombre = "Primer nombre es requerido";
    if (!formData.primerApellido) newErrors.primerApellido = "Primer apellido es requerido";
    if (!formData.identificador) newErrors.identificador = "Correo es requerido";
    if (!formData.contraseña_usuario) newErrors.contraseña_usuario = "Contraseña es requerida";
    else if (formData.contraseña_usuario.length < 6) newErrors.contraseña_usuario = "La contraseña debe tener al menos 6 caracteres";
    if (formData.contraseña_usuario !== formData.confirmPassword) newErrors.confirmPassword = "Las contraseñas no coinciden";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Redirigir sin hacer la llamada a la API por ahora
      console.log("Redirigiendo a la página de registro...");
      navigate('/register');

      toast.success("Redirigiendo a la página de registro!", {
        position: "top-right",
        autoClose: 5000,
        style: {
          backgroundColor: '#4bb6b7',
          color: '#ffffff',
          fontWeight: 'bold',
        },
      });
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setResetError("El correo electrónico es requerido");
    } else {
      setResetError(""); // Limpia el error si ya se ha ingresado un correo válido
  
      // Realiza la llamada a la API para enviar el enlace de restablecimiento
      try {
        const response = await axios.post('http://localhost:4000/api/usuarios/reset-password', { email: resetEmail });
        
        // Si la respuesta es exitosa, muestra el mensaje de éxito
        toast.success("Se ha enviado el enlace para restablecer tu contraseña", {
          position: "top-right",
          autoClose: 5000,
          style: {
            backgroundColor: '#4bb6b7',
            color: '#ffffff',
            fontWeight: 'bold',
          },
        });
        
        // Oculta el modal una vez enviado el correo de restablecimiento
        setShowResetPasswordModal(false);
  
      } catch (error) {
        // Muestra un mensaje de error si algo falla durante la solicitud a la API
        toast.error("Error al enviar el enlace. Intenta nuevamente.", {
          position: "top-right",
          autoClose: 5000,
          style: {
            backgroundColor: '#ff4d4d',
            color: '#ffffff',
            fontWeight: 'bold',
          },
        });
      }
    }
  };
  
  const handleCloseModal = () => {
    setResetError(""); // Limpia el error al cerrar el modal
    const modalElement = document.querySelector('.modal');
    modalElement.classList.remove('show'); // Retirar clase show para iniciar la animación de cierre
    setTimeout(() => {
      setShowResetPasswordModal(false); // Ocultar el modal después de la animación
    }, 500); // Debe coincidir con la duración de la transición de la clase CSS
  };

  return (
    
    <div className={`container ${!isLogin ? "right-panel-active" : ""}`}>
      {/* Formulario de Login */}
      <div className="form-container login-container">
        <form onSubmit={handleLoginSubmit}>
          <h2 className="title">Iniciar Sesión</h2>
          <div className="form-control">
            <input
              type="text"
              name="identificador"
              placeholder="Correo o Nombre de Usuario" 
              onChange={handleChange}
              required
            />
            {errors.identificador && <small>{errors.identificador}</small>}
          </div>
          <div className="form-control">
            <input
              type="password"
              name="contraseña_usuario"
              placeholder="Contraseña"
              onChange={handleChange}
              required
            />
            {errors.contraseña_usuario && <small>{errors.contraseña_usuario}</small>}
          </div>

          <div style={{ marginBottom: '10px', textAlign: 'left' }}>
            <button 
              type="button" 
              onClick={() => setShowResetPasswordModal(true)} 
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#4bb6b7', 
                cursor: 'pointer', 
                fontSize: '14px' 
              }}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button type="submit">Iniciar Sesión</button>
          <span>
            ¿No tienes cuenta?{" "}
            <button type="button" onClick={toggleForm} style={{ background: 'none', border: 'none', color: '#4bb6b7', cursor: 'pointer' }}>
              Pre-Regístrate
            </button>
          </span>
        </form>
      </div>

      {/* Modal Reiniciar contraseña */}
      {showResetPasswordModal && (
        <div className={`modal ${showResetPasswordModal ? 'show' : ''}`}>
          <div className={`modal-content ${showResetPasswordModal ? 'show' : ''}`}>
            <span className="close" onClick={() => {
              setResetError(""); // Limpia el error al cerrar el modal
              setShowResetPasswordModal(false);
              {handleCloseModal};
            }}>&times;</span>
            <h1>Restablecer Contraseña</h1>
            <p>Ingresa tu correo electrónico para recibir un enlace de restablecimiento</p>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className={resetError ? 'error' : ''}
            />
            {resetError && <small style={{ color: 'red', display: 'block' }}>{resetError}</small>}
            <button onClick={handleResetPassword}>Enviar</button>
          </div>
        </div>
      )}





      {/* Formulario de Pre-Registro */}
      <div className="form-container register-container">
        <form onSubmit={handleRegisterSubmit}>
          <h2 className="title">Pre-Registro</h2>
          
          {/* Campo para Primer Nombre */}
          <div className="form-control2">
            <input
              type="text"
              name="primerNombre"
              placeholder="Primer Nombre"
              onChange={handleChange}
              required
            />
            <span></span>
            {errors.primerNombre && <small className="error-message">{errors.primerNombre}</small>}
          </div>

          {/* Campo para Primer Apellido */}
          <div className="form-control2">
            <input
              type="text"
              name="primerApellido"
              placeholder="Primer Apellido"
              onChange={handleChange}
              required
            />
            <span></span>
            {errors.primerApellido && <small className="error-message">{errors.primerApellido}</small>}
          </div>

          {/* Campo para Correo Electrónico */}
          <div className="form-control2">
            <input
              type="email"
              name="identificador"
              placeholder="Correo Electrónico"
              onChange={handleChange}
              required
            />
            <span></span>
            {errors.identificador && <small className="error-message">{errors.identificador}</small>}
          </div>

          {/* Campo para Contraseña */}
          <div className="form-control2">
            <input
              type="password"
              name="contraseña_usuario"
              placeholder="Contraseña"
              onChange={handleChange}
              required
            />
            <span></span>
            {errors.contraseña_usuario && <small className="error-message">{errors.contraseña_usuario}</small>}
          </div>

          {/* Campo para Confirmar Contraseña */}
          <div className="form-control2">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirma Contraseña"
              onChange={handleChange}
              required
            />
            <span></span>
            {errors.confirmPassword && <small className="error-message">{errors.confirmPassword}</small>}
          </div>

          {/* Botón de Pre-Registro */}
          <button type="submit" className="submit-button">Continuar</button>
        </form>
      </div>
                
      {/* Panel de Overlay */}
      <div className="overlay-container">
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <h1>¡Bienvenido de nuevo!</h1>
            <p>Para mantenerte conectado con nosotros, pre-registrate </p>
            <button className="ghost" id="signIn" onClick={toggleForm}>Iniciar Sesión</button>
          </div>
          <div className="overlay-panel overlay-right">
            <h2>Saint Patrick´s Academy</h2>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default LoginRegister;
