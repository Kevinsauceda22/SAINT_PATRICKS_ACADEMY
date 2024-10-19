import React, { useState } from 'react';
import './login.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
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
  const [errors, setErrors] = useState({
    email: '',
    contraseña: '',
});

  
  const navigate = useNavigate();
 


  const toggleForm = () => {
    setIsLogin((prev) => !prev);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' }); // Limpiar mensaje de error al cambiar el input

  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    
    // Verifica si el email es repetitivo
    if (/^(a+)$/.test(email)) {
        setErrors({ ...errors, email: 'Verifica este campo' });
        setFormData({ ...formData, identificador: '' }); // Limpiar el input
    } else {
        setErrors({ ...errors, email: '' }); // Limpiar mensaje de error
    }
    setFormData({ ...formData, identificador: email });
};
const handleResetPassword = () => {
  Swal.fire({
    title: 'Restablecer Contraseña',
    input: 'email',
    inputPlaceholder: 'Ingresa tu correo electrónico',
    showCancelButton: true,
    confirmButtonText: 'Enviar',
    cancelButtonText: 'Cancelar',
    inputValidator: (value) => {
      return !value && '¡Necesitas ingresar un correo electrónico!';
    }
  }).then((result) => {
    if (result.isConfirmed) {
      // Lógica para restablecer la contraseña
      resetPassword(result.value)
        .then((response) => {
          // Manejar la respuesta exitosa
          Swal.fire('¡Éxito!', 'Se ha enviado un correo para restablecer tu contraseña.', 'success');
        })
        .catch((error) => {
          // Manejar errores
          Swal.fire('Error', 'No se pudo restablecer la contraseña. Intenta de nuevo más tarde.', 'error');
        });
    }
  });
};

// Función para realizar la solicitud al backend
const resetPassword = async (correo_usuario) => {
  try {
    const response = await fetch('http://localhost:4000/api/usuarios/olvide-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ correo_usuario }), // Asegúrate de pasar el email correcto
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.mensaje || 'Error al enviar el correo de restablecimiento');
    }

    return await response.json(); // Aquí puedes retornar la respuesta si la necesitas
  } catch (error) {
    console.error(error);
    throw error; // Lanzar el error para manejarlo en el catch
  }
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
  
      // Si el inicio de sesión es exitoso, muestra el toast de éxito
      toast.success("Inicio de sesión exitoso.", {
          position: "top-right",
          autoClose: 5000,
          style: {
              backgroundColor: '#4caf50',
              color: '#ffffff',
              fontWeight: 'bold',
          },
      });
  
      // Redirigir al dashboard
      navigate('/dashboard');
      window.location.reload();
  } catch (error) {
      // Capturar los detalles del error
      if (error.response) {
          const errorMessage = error.response.data.mensaje; // Obtener el mensaje del backend
          
          // Mostrar un mensaje de error específico según el mensaje del backend
          switch (errorMessage) {
              case 'Usuario no encontrado':
                  toast.error("El correo no está registrado.", {
                      position: "top-right",
                      autoClose: 5000,
                      style: {
                          backgroundColor: '#ff4d4d',
                          color: '#ffffff',
                          fontWeight: 'bold',
                      },
                  });
                  break;
              case 'Cuenta no confirmada. Por favor, verifica tu correo electrónico.':
                  toast.error("Por favor verifica tu correo electrónico para iniciar sesión.", {
                      position: "top-right",
                      autoClose: 5000,
                      style: {
                          backgroundColor: '#ff4d4d',
                          color: '#ffffff',
                          fontWeight: 'bold',
                      },
                  });
                  break;
              case 'Contraseña o nombre de usuario/correo incorrecto':
                  toast.error("Correo o contraseña incorrecta.", {
                      position: "top-right",
                      autoClose: 5000,
                      style: {
                          backgroundColor: '#ff4d4d',
                          color: '#ffffff',
                          fontWeight: 'bold',
                      },
                  });
                  break;
              case 'Has ingresado una contraseña antigua':
                  toast.error("Has ingresado una contraseña antigua.", {
                      position: "top-right",
                      autoClose: 5000,
                      style: {
                          backgroundColor: '#ff4d4d',
                          color: '#ffffff',
                          fontWeight: 'bold',
                      },
                  });
                  break;
              default:
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
      } else if (error.request) {
          console.error("No se recibió respuesta del servidor:", error.request);
          toast.error("No se recibió respuesta del servidor. Intenta nuevamente.", {
              position: "top-right",
              autoClose: 5000,
              style: {
                  backgroundColor: '#ff4d4d',
                  color: '#ffffff',
                  fontWeight: 'bold',
              },
          });
      } else {
          console.error("Error al hacer la solicitud:", error.message);
          toast.error("Error al hacer la solicitud. Intenta nuevamente.", {
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
  
  }
};


  // Manejador para el Pre-Registro
  const handleRegisterSubmit = async (e) => {
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

    // Si hay errores, no continuar
    if (Object.keys(newErrors).length > 0) return;

    try {
        // Si no hay errores, enviar los datos al servidor
        const response = await axios.post('http://localhost:4000/api/usuarios/pre-registrar-padre', {
            primer_nombre: formData.primerNombre,
            primer_apellido: formData.primerApellido,
            correo_usuario: formData.identificador, // Cambiar el nombre a correo_usuario
            contraseña_usuario: formData.contraseña_usuario,
            confirmar_contraseña: formData.confirmPassword, // Agregar el campo de confirmación
            Primer_ingreso: true, // Marcamos que es el primer ingreso
        });

        // Manejo de la respuesta del servidor
        toast.success("Registro exitoso. Por favor, revisa tu correo electrónico para confirmar.", {
            position: "top-right",
            autoClose: 5000,
            style: {
                backgroundColor: '#4caf50',
                color: '#ffffff',
                fontWeight: 'bold',
            },
        });

        // Redirigir al usuario a la página de confirmación de correo electrónico
        navigate(`/confirmacion-email/${formData.identificador}`); // Cambiar a la ruta correcta
        window.location.reload();

    } catch (error) {
        // Manejo de errores de la solicitud
        if (error.response) {
            // El servidor respondió con un código de estado que no está en el rango de 2xx
            toast.error(error.response.data.mensaje || "Error al registrar el usuario.", {
                position: "top-right",
                autoClose: 5000,
                style: {
                    backgroundColor: '#f44336',
                    color: '#ffffff',
                    fontWeight: 'bold',
                },
            });
        } else {
            // Error al hacer la solicitud
            toast.error("Error de conexión. Por favor, intenta más tarde.", {
                position: "top-right",
                autoClose: 5000,
                style: {
                    backgroundColor: '#f44336',
                    color: '#ffffff',
                    fontWeight: 'bold',
                },
            });
        }
    }
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
            <span></span>
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
            <span></span>
            {errors.contraseña_usuario && <small>{errors.contraseña_usuario}</small>}
          </div>
          <button type="submit">Iniciar Sesión</button>
          <span>
            ¿Olvidaste tu contraseña?{" "}
            <button type="button" onClick={handleResetPassword} style={{  background: '#318f49', // Color de fondo
    border: 'none', // Sin borde
    color: '#fff', // Color del texto
    cursor: 'pointer', // Cursor de mano al pasar
    padding: '10px 20px', // Espaciado interno
    borderRadius: '12px', // Bordes redondeados
    fontSize: '9px', // Tamaño de la fuente
    fontWeight: 'bold', // Negrita
    transition: 'background 0.3s, transform 0.3s', // Transiciones suaves
      }}>
              Recupera tu contraseña aquí
            </button>
          </span>
        </form>
      </div>

      {/* Formulario de Pre-Registro */}
      <div className="form-container register-container">
        <form onSubmit={handleRegisterSubmit}>
          <h2 className="title">Pre-Registro</h2>
          
          {/* Campo para Primer Nombre */}
          <div className="form-control2">
            <input
              type="text"
              name="primerNombre"
              placeholder="Primer Nombre (Requerido)"
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
              placeholder="Primer Apellido (Requerido)"
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
              placeholder="Correo Electrónico (Requerido)"
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
              placeholder="Contraseña (Requerido)"
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
              placeholder="Confirma Contraseña (Requerido)"
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
            <p>Para mantenerte conectado con nosotros, inicia sesión con tus datos asignados</p>
            <button className="ghost" id="signIn" onClick={toggleForm}>Iniciar Sesión</button>
          </div>
          <div className="overlay-panel overlay-right">
            <h2>Saint Patrick´s Academy</h2>
            <p>Ingresa tus datos personales y comienza tu viaje con nosotros</p>
            <button className="ghost" id="signUp" onClick={toggleForm}>Pre-Regístrate</button>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default LoginRegister;
