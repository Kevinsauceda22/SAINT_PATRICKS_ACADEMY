import React, { useState } from 'react';
import './login.css';

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    dni: "",
    firstName: "",
    secondName: "",
    firstLastName: "",
    secondLastName: "",
    nationality: "",
    address: "",
    birthDate: "",
  });
  const [errors, setErrors] = useState({});

  const toggleForm = () => {
    setIsLogin((prev) => !prev);
    setErrors({}); // Limpiar los errores al cambiar de formulario
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email es requerido";
    }

    if (!formData.password) {
      newErrors.password = "Contraseña es requerida";
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    // Validar campos adicionales si es registro
    if (!isLogin) {
      if (!formData.dni) {
        newErrors.dni = "DNI es requerido";
      }
      if (!formData.firstName) {
        newErrors.firstName = "Primer Nombre es requerido";
      }
      if (!formData.firstLastName) {
        newErrors.firstLastName = "Primer Apellido es requerido";
      }
      if (!formData.nationality) {
        newErrors.nationality = "Nacionalidad es requerida";
      }
      if (!formData.address) {
        newErrors.address = "Dirección es requerida";
      }
      if (!formData.birthDate) {
        newErrors.birthDate = "Fecha de nacimiento es requerida";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      if (isLogin) {
        console.log("Login data:", formData);
        // Lógica de login
      } else {
        console.log("Registro data:", formData);
        // Lógica de registro
      }
    }
  };

  return (
    <div className={`container ${!isLogin ? "right-panel-active" : ""}`}>
      <div className="clover-container">
        <div className="clover"></div>
        <div className="clover"></div>
        <div className="clover"></div>
      </div>

      {/* Formulario de Login */}
      <div className="form-container login-container">
        <form onSubmit={handleSubmit}>
          <h1 className="title">Iniciar Sesión</h1>
          <div className="form-control">
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
            />
            <span></span>
            {errors.email && <small>{errors.email}</small>}
          </div>
          <div className="form-control">
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              onChange={handleChange}
              required
            />
            <span></span>
            {errors.password && <small>{errors.password}</small>}
          </div>
          <button type="submit">Iniciar Sesión</button>
          <span>
            ¿No tienes cuenta?{" "}
            <button
              type="button"
              onClick={toggleForm}
              style={{
                background: 'none',
                border: 'none',
                color: '#4bb6b7',
                cursor: 'pointer',
              }}
            >
              Regístrate
            </button>
          </span>
        </form>
      </div>

      {/* Formulario de Registro */}
      <div className="form-container register-container">
        <form onSubmit={handleSubmit}>
          <h1 className="title">Regístrate</h1>

          <div className="form-control2">
            <input
              type="text"
              name="dni"
              placeholder="DNI"
              onChange={handleChange}
              required
            />
            <span></span>
            {errors.dni && <small>{errors.dni}</small>}
          </div>

          <div className="form-control2">
            <input
              type="text"
              name="firstName"
              placeholder="Primer Nombre"
              onChange={handleChange}
              required
            />
            <span></span>
            {errors.firstName && <small>{errors.firstName}</small>}
          </div>

          {/* Otros campos... */}
          
          <div className="form-control2">
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              onChange={handleChange}
              required
            />
            <span></span>
            {errors.password && <small>{errors.password}</small>}
          </div>

          <div className="form-control2">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirma Contraseña"
              onChange={handleChange}
              required
            />
            <span></span>
            {errors.confirmPassword && <small>{errors.confirmPassword}</small>}
          </div>

          <button type="submit">Regístrate</button>

          <span>
            ¿Ya tienes cuenta?{" "}
            <button
              type="button"
              onClick={toggleForm}
              style={{
                background: 'none',
                border: 'none',
                color: '#4bb6b7',
                cursor: 'pointer',
              }}
            >
              Inicia Sesión
            </button>
          </span>
        </form>
      </div>

      {/* Panel de Overlay */}
      <div className="overlay-container">
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <h1>¡Bienvenido de nuevo!</h1>
            <p>Para mantenerte conectado con nosotros, inicia sesión con tus datos asignados</p>
            <button className="ghost" id="login" onClick={toggleForm}>
              Iniciar Sesión
            </button>
          </div>
          <div className="overlay-panel overlay-right">
            <h1>Saint Patrick's Academy</h1>
            <p>Si no tienes cuenta aun, registra tus datos aquí.</p>
            <button className="ghost" id="register" onClick={toggleForm}>
              Regístrate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
