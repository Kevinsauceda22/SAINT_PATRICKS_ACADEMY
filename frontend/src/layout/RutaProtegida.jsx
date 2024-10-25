import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth'; // Asegúrate de que el hook useAuth esté correcto
import { CSpinner } from '@coreui/react'; // Spinner de CoreUI
import PropTypes from 'prop-types'; // Validación de propiedades
import './AuthError.css'; // Asegúrate de crear o editar este archivo CSS

const RutaProtegida = () => {
  const { auth, loading, error } = useAuth(); // Asegúrate de que useAuth devuelva error

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

  // Verifica si el usuario está autenticado
  if (!auth || !auth.cod_usuario) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderiza los componentes hijos
  return <Outlet />;
};

// Agregar validaciones de tipo (opcional)
RutaProtegida.propTypes = {
  children: PropTypes.node, // No es necesario si solo usas Outlet
};

export default RutaProtegida;
