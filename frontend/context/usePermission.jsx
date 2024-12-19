import { useState, useEffect, useCallback, useContext } from 'react';
import AuthContext from '../context/AuthProvider';
import axios from 'axios';

export const usePermission = (objectName) => {
  const { auth } = useContext(AuthContext);
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const context = useContext(AuthContext);

  const fetchData = useCallback(async () => {
    if (!auth || !objectName) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token available');
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        params: {
          Cod_rol: auth.cod_rol,
          Nom_objeto: objectName,
        },
      };

      const response = await axios.get(`http://74.50.68.87/api/usuarios/permisos`, config);

      // Verificar si hay datos en la respuesta
      if (response.data && response.data.permissions && response.data.permissions.length > 0) {
        setPermissions(response.data.permissions[0]); // Tomar el primer elemento del array
      } else {
        setPermissions(null);
      }
      setError(null);
    } catch (error) {
      console.error("Error al obtener permisos:", error);
      setError(error);
      setPermissions(null);
    } finally {
      setLoading(false);
    }
  }, [auth, objectName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calcular los permisos basados en el estado actual
  const canSelect = Boolean(permissions?.Permiso_Modulo === '1' && permissions?.Permiso_Consultar === '1');
  const canInsert = Boolean(canSelect && permissions?.Permiso_Insercion === '1');
  const canUpdate = Boolean(canSelect && permissions?.Permiso_Actualizacion === '1');
  const canDelete = Boolean(canSelect && permissions?.Permiso_Eliminacion === '1');
  const canNavigate = Boolean(permissions?.Permiso_Nav === '1');
  const canView = Boolean(permissions?.Permiso_Ver === '1');
  const hasAccess = canSelect;

  return {
    canSelect,
    canInsert,
    canUpdate,
    canDelete,
    canNavigate,
    canView,
    hasAccess,
    loading,
    error,
    permissions
  };
};

export default usePermission;