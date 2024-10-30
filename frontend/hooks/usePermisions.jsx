import { useContext } from 'react';
import AuthContext from '../context/AuthProvider'; // Asegúrate de que la ruta sea correcta

const usePermissions = () => {
  const { auth } = useContext(AuthContext);

  // Función para verificar permisos
  const tienePermiso = (modulo, accion) => {
    if (!auth || !auth.permisos) return false; // Retorna false si no hay auth o permisos

    // Verifica si el módulo y la acción están definidos en los permisos
    const permisosModulo = auth.permisos[modulo];

    // Retorna true si tiene el permiso correspondiente
    return permisosModulo && permisosModulo[accion];
  };

  // Función para verificar el rol
  const tieneRol = (rol) => {
    return auth && auth.Cod_rol === rol; // Verifica si el rol coincide
  };

  return { tienePermiso, tieneRol };
};

export default usePermissions;
