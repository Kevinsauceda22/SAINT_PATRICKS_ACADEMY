import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth'; // Asegúrate de que el hook useAuth esté correcto

const RutaPublica = () => {
  const { auth } = useAuth(); // Obtiene el estado de autenticación

  // Si el usuario está autenticado, redirigir a la ruta deseada (ejemplo: /dashboard)
  if (auth && auth.cod_usuario) {
    return <Navigate to="/active-session" replace />;
  }

  // Si no está autenticado, renderiza el componente hijo
  return <Outlet />;
};

export default RutaPublica;
