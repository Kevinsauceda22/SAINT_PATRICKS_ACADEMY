import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth'; // Asegúrate de que el hook useAuth esté correcto
import { CSpinner } from '@coreui/react'; // Spinner de CoreUI
import PropTypes from 'prop-types'; // Validación de propiedades

const RutaProtegida = () => {
  const { auth, loading, error } = useAuth(); // Asegúrate de que useAuth devuelva error

  // Pantalla de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="text-center">
        <CSpinner color="primary" variant="grow" />
      </div>
    );
  }

  // Manejo de error de autenticación
  if (error) {
    return <div>Error al verificar autenticación: {error.message}</div>; // Mensaje de error si es necesario
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
