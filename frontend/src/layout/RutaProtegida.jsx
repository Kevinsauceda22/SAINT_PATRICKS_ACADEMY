import axios from 'axios';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { CSpinner } from '@coreui/react';
import PropTypes from 'prop-types';
import './AuthError.css';

const RutaProtegida = () => {
  const { auth, loading, error } = useAuth();

  // Pantalla de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="loading-container">
        <CSpinner color="primary" variant="grow" />
        <p>Cargando...</p>
      </div>
    );
  }

  // Manejo de error de autenticación con diseño
  if (error) {
    return (
      <div className="auth-error-container">
        <div className="auth-error-box">
          <h2>¡Sesión expirada!</h2>
          <p>Tu sesión ha expirado. Por favor, inicia sesión nuevamente.</p>
          <button onClick={() => window.location.href = "/login"} className="auth-error-button">
            Volver a iniciar sesión
          </button>
        </div>
      </div>
    );
  }
  console.log()
  // Verifica si el usuario no está autenticado
  if (!auth || !auth.cod_usuario) {
    // Lógica para actualizar otp_verified antes de redirigir
    const actualizarEstadoOtp = async () => {
      try {
        await axios.put(
          `http://74.50.68.87/api/usuarios/actualizarOtp/${auth?.cod_usuario}`,
          { otp_verified: 0 }
        );
        console.log('Estado otp_verified actualizado correctamente');
      } catch (error) {
        console.error('Error al actualizar otp_verified:', error);
      }
    };

    // Llama a la función de actualización
    actualizarEstadoOtp();

    // Redirige al usuario a la página de inicio de sesión
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderiza los componentes hijos
  return <Outlet />;
};

RutaProtegida.propTypes = {
  children: PropTypes.node,
};

export default RutaProtegida;
