import React, { useState } from 'react';
import './login.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom'; // Cambia useHistory a useNavigate


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
  const [errors, setErrors] = useState({});
  const navigate = useNavigate(); // Cambia history a navigate

  const toggleForm = () => {
    setIsLogin((prev) => !prev);
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validación de formulario
    if (!formData.identificador) newErrors.identificador = "Identificador es requerido";
    if (!formData.contraseña_usuario) newErrors.contraseña_usuario = "Contraseña es requerida";
    else if (formData.contraseña_usuario.length < 6) newErrors.contraseña_usuario = "La contraseña debe tener al menos 6 caracteres";
    if (!isLogin && formData.contraseña_usuario !== formData.confirmPassword) newErrors.confirmPassword = "Las contraseñas no coinciden";

    // Validación adicional para registro
    if (!isLogin) {
        if (!formData.dni) newErrors.dni = "DNI es requerido";
        if (!formData.primerNombre) newErrors.primerNombre = "Primer nombre es requerido";
        if (!formData.primerApellido) newErrors.primerApellido = "Primer apellido es requerido";
        if (!formData.nacionalidad) newErrors.nacionalidad = "Nacionalidad es requerida";
        if (!formData.direccion) newErrors.direccion = "Dirección es requerida";
        if (!formData.fechaNacimiento) newErrors.fechaNacimiento = "Fecha de nacimiento es requerida";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
        try {
            const url = isLogin 
                ? 'http://localhost:4000/api/usuarios/login' 
                : 'http://localhost:4000/api/usuarios/register';

            const data = isLogin 
                ? { identificador: formData.identificador, contraseña_usuario: formData.contraseña_usuario }
                : { ...formData };

            const response = await axios.post(url, data);
            console.log(response.data);

            toast.success("Operación exitosa!", {
                position: "top-right",
                autoClose: 5000,
                style: {
                    backgroundColor: '#4bb6b7',
                    color: '#ffffff',
                    fontWeight: 'bold',
                },
            });

            if (isLogin) {
                // Redirigir al dashboard después de iniciar sesión
                navigate('/dashboard'); // Cambia '/dashboard' a la ruta de tu dashboard
            }

        } catch (error) {
            // Manejo de errores según la respuesta del servidor
            if (error.response) {
                const errorMessage = error.response.data.mensaje; // Extrae el mensaje de error
                toast.error(errorMessage || "Error en el proceso. Por favor, intenta de nuevo.", {
                    position: "top-right",
                    autoClose: 5000,
                    style: {
                        backgroundColor: '#ff4d4d',
                        color: '#ffffff',
                        fontWeight: 'bold',
                    },
                });

                // Manejo específico para el caso de no confirmación
                if (error.response.status === 403 && errorMessage.includes("confirma tu correo electrónico")) {
                    toast.warn("Por favor, confirma tu correo electrónico antes de iniciar sesión.", {
                        position: "top-left",
                        autoClose: 5000,
                        className: 'toast-warning', // Clase personalizada

                    });
                }
            } else {
                console.error(error);
                toast.error("Error en el proceso. Por favor, intenta de nuevo.", {
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


  return (
    <div className={`container ${!isLogin ? "right-panel-active" : ""}`}>
      {/* Formulario de Login */}
      <div className="form-container login-container">
        <form onSubmit={handleSubmit}>
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
            ¿No tienes cuenta?{" "}
            <button type="button" onClick={toggleForm} style={{ background: 'none', border: 'none', color: '#4bb6b7', cursor: 'pointer' }}>
              Pre-Regístrate
            </button>
          </span>
        </form>
      </div>

{/* Formulario de Registro para el Padre */}
<div className="form-container register-container">
  <form onSubmit={handleSubmit}>
  

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
    
    {/* Botón de Registro */}
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
