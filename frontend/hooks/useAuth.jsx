import { useContext } from 'react';
import AuthContext from '../context/AuthProvider'; // Asegúrate de que la ruta sea correcta

const useAuth = () => {
  const context = useContext(AuthContext);
  console.log('Auth Context:', context); // Log para verificar el contexto
  return context;
};

export default useAuth;
