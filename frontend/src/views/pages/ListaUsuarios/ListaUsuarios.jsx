import React, { useEffect, useState } from 'react';
import { Shield, ShieldOff, AlertCircle, Search, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingUsers, setProcessingUsers] = useState(new Set()); // Para deshabilitar botones durante el proceso

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    if (!token) {
      toast.error('No se ha encontrado el token. Por favor, inicia sesión nuevamente.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('http://localhost:4000/api/usuarios/Todos-los-usuarios', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = Array.isArray(response.data[0]) ? response.data[0] : response.data;
      setUsers(userData);

      if (userData.length > 0) {
        toast.success('Usuarios cargados correctamente');
      } else {
        toast.warning('No se encontraron usuarios');
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error(error.response?.data?.mensaje || 'Error al cargar usuarios');
      setErrorMessage(error.response?.data?.mensaje || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    // Si el usuario ya está en proceso, no hacer nada
    if (processingUsers.has(userId)) {
      return;
    }

    const statusTexts = {
      1: 'activar',
      2: 'desactivar',
      3: 'suspender'
    };

    if (!window.confirm(`¿Estás seguro de que deseas ${statusTexts[newStatus]} este usuario?`)) {
      return;
    }

    const token = localStorage.getItem('token');
    
    if (!token) {
      toast.error('No se encontró el token de autenticación');
      return;
    }

    try {
      // Agregar usuario a la lista de procesamiento
      setProcessingUsers(prev => new Set(prev).add(userId));

      // Asegúrate que los nombres de las propiedades coincidan con lo que espera el backend
      const response = await axios.put(
        'http://localhost:4000/api/usuarios/cambiar-estado',
        {
          userId: userId,
          Cod_estado_usuario: newStatus  // Cambiado para coincidir con el nombre en la base de datos
        },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.status === 200) {
        // Actualizar el estado del usuario localmente
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.cod_usuario === userId 
              ? { ...user, Cod_estado_usuario: newStatus }
              : user
          )
        );
        toast.success('Estado actualizado correctamente');
      }
    } catch (error) {
      console.error('Error detallado:', error.response?.data);
      toast.error(error.response?.data?.mensaje || 'Error al cambiar el estado del usuario');
    } finally {
      // Remover usuario de la lista de procesamiento
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
};

  const getStatusIcon = (status) => {
    switch (status) {
      case 1: return <Shield className="status-icon active" size={18} />;
      case 2: return <ShieldOff className="status-icon inactive" size={18} />;
      case 3: return <AlertCircle className="status-icon suspended" size={18} />;
      default: return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 1: return 'Activo';
      case 2: return 'Inactivo';
      case 3: return 'Suspendido';
      default: return 'Desconocido';
    }
  };

  const getRoleText = (Cod_rol) => {
    switch (Cod_rol) {
      case 1: return 'Padre';           
      case 2: return 'Administrador';    
      case 3: return 'Docente';          
      default: return 'Desconocido';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.nombre_usuario?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (user.correo_electronico?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === 'all' || user.Cod_estado_usuario === parseInt(statusFilter);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="user-management">
      <div className="header">
        <h1>Gestión de Usuarios</h1>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        
        <div className="controls">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-box">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="1">Activos</option>
              <option value="2">Inactivos</option>
              <option value="3">Suspendidos</option>
            </select>
            <ChevronDown size={20} className="select-icon" />
          </div>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-message">Cargando usuarios...</div>
        ) : (
          <>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.cod_usuario}>
                    <td className="user-cell">
                      <div className="user-info">
                        <span className="user-name">{user.nombre_usuario}</span>
                        <span className="user-email">{user.correo_electronico}</span>
                      </div>
                    </td>
                    <td>{getRoleText(user.Cod_rol)}</td>
                    <td>
                      <span className={`status-badge status-${user.Cod_estado_usuario}`}>
                        {getStatusIcon(user.Cod_estado_usuario)}
                        {getStatusText(user.Cod_estado_usuario)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-activate"
                          onClick={() => handleStatusChange(user.cod_usuario, 1)}
                          disabled={user.Cod_estado_usuario === 1 || processingUsers.has(user.cod_usuario)}
                        >
                          Activar
                        </button>
                        <button
                          className="btn btn-deactivate"
                          onClick={() => handleStatusChange(user.cod_usuario, 2)}
                          disabled={user.Cod_estado_usuario === 2 || processingUsers.has(user.cod_usuario)}
                        >
                          Desactivar
                        </button>
                        <button
                          className="btn btn-suspend"
                          onClick={() => handleStatusChange(user.cod_usuario, 3)}
                          disabled={user.Cod_estado_usuario === 3 || processingUsers.has(user.cod_usuario)}
                        >
                          Suspender
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="no-results-message">
                No se encontraron usuarios que coincidan con tu búsqueda.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagement;