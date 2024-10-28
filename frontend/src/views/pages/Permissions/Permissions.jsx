import React, { useState } from 'react';

const MinimalPermissionManager = () => {
  const [showWarning, setShowWarning] = useState(true);

  const handleCloseWarning = () => {
    setShowWarning(false);
  };

  const pages = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'usuarios', name: 'Usuarios' },
    { id: 'cursos', name: 'Cursos' },
    { id: 'notas', name: 'Notas' },
    { id: 'reportes', name: 'Reportes' },
    { id: 'configuracion', name: 'Configuración' },
  ];

  const permissions = [
    { id: 'read', name: 'Ver' },
    { id: 'create', name: 'Crear' },
    { id: 'update', name: 'Editar' },
    { id: 'delete', name: 'Eliminar' },
  ];

  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Juan Pérez',
      role: 'Padre',
      permissions: pages.reduce((acc, page) => ({
        ...acc,
        [page.id]: { read: true, create: false, update: false, delete: false },
      }), {}),
    },
    {
      id: 2,
      name: 'María Docente',
      role: 'Docente',
      permissions: pages.reduce((acc, page) => ({
        ...acc,
        [page.id]: { read: true, create: true, update: true, delete: false },
      }), {}),
    },
    {
      id: 3,
      name: 'Admin Sistema',
      role: 'Admin',
      permissions: pages.reduce((acc, page) => ({
        ...acc,
        [page.id]: { read: true, create: true, update: true, delete: true },
      }), {}),
    },
  ]);

  const handlePermissionChange = (userId, pageId, permissionId) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          permissions: {
            ...user.permissions,
            [pageId]: {
              ...user.permissions[pageId],
              [permissionId]: !user.permissions[pageId][permissionId],
            },
          },
        };
      }
      return user;
    }));
  };

  const styles = `
    .container {
      padding: 2rem;
      background-color: #f9f9f9;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .minimal-table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      font-size: 14px;
      border-radius: 8px;
      overflow: hidden;
    }

    .minimal-table th {
      padding: 15px;
      text-align: left;
      font-weight: 600;
      border-bottom: 1px solid #ddd;
      color: #333;
      background-color: #f1f1f1;
    }

    .minimal-table td {
      padding: 15px;
      border-bottom: 1px solid #f0f0f0;
    }

    .user-cell {
      position: sticky;
      left: 0;
      background: white;
      z-index: 10;
      border-right: 1px solid #ddd;
    }

    .user-name {
      font-weight: 600;
      color: #333;
      margin: 0;
    }

    .user-role {
      color: #666;
      font-size: 12px;
      margin: 0;
    }

    .permission-cell {
      min-width: 160px;
    }

    .permission-group {
      display: grid;
      gap: 10px;
    }

    .permission-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .permission-label {
      color: #666;
      font-size: 14px;
    }

    .switch {
      position: relative;
      display: inline-block;
      width: 28px;
      height: 16px;
    }

    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ddd;
      transition: .2s;
      border-radius: 16px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 12px;
      width: 12px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: .2s;
      border-radius: 50%;
    }

    input:checked + .slider {
      background-color: #4CAF50;
    }

    input:checked + .slider:before {
      transform: translateX(12px);
    }

    .permissions-header {
      margin-bottom: 20px;
    }

    .title {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }

    .subtitle {
      color: #666;
      margin: 4px 0 0 0;
      font-size: 16px;
    }

    .table-container {
      overflow-x: auto;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .warning-message {
      background-color: #ffcc00;
      padding: 20px;
      border: 1px solid #ffd600;
      border-radius: 8px;
      color: #333;
      margin-bottom: 20px;
      font-weight: bold;
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: background-color 0.3s ease;
    }

    .warning-message:hover {
      background-color: #ffe68c;
    }

    .close-button {
      background: transparent;
      border: none;
      color: #333;
      font-weight: bold;
      cursor: pointer;
      font-size: 14px;
      margin-left: 20px;
      transition: color 0.2s;
    }

    .close-button:hover {
      text-decoration: underline;
      color: #ff0000; /* Cambiar a color rojo al pasar el mouse */
    }

    @media (max-width: 600px) {
      .permission-cell {
        min-width: 120px;
      }
    }
  `;

  return (
    <div className="container">
      <style>{styles}</style>

      {showWarning && (
        <div className="warning-message">
          <span>
            ADVERTENCIA: AL MODIFICAR ALGO EN ESTA PÁGINA ESTÁS MODIFICANDO LOS PERMISOS A LOS DEMÁS USUARIOS.
          </span>
          <button onClick={handleCloseWarning} className="close-button">
            Cerrar
          </button>
        </div>
      )}
      
      <div className="permissions-header">
        <h1 className="title">Permisos del Sistema</h1>
        <p className="subtitle">Gestiona los accesos por usuario y página</p>
      </div>

      <div className="table-container">
        <table className="minimal-table">
          <thead>
            <tr>
              <th className="user-cell">Usuario</th>
              {pages.map(page => (
                <th key={page.id}>{page.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="user-cell">
                  <p className="user-name">{user.name}</p>
                  <p className="user-role">{user.role}</p>
                </td>
                {pages.map(page => (
                  <td key={page.id} className="permission-cell">
                    <div className="permission-group">
                      {permissions.map(permission => (
                        <div key={permission.id} className="permission-row">
                          <span className="permission-label">{permission.name}</span>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={user.permissions[page.id][permission.id]}
                              onChange={() => handlePermissionChange(user.id, page.id, permission.id)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MinimalPermissionManager;
