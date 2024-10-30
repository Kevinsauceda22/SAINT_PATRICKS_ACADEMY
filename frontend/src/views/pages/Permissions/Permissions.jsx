import React, { useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const GestorDePermisos = ({ pathName }) => { // Recibiendo pathName como prop
  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(true);

  const cerrarAdvertencia = () => {
    setMostrarAdvertencia(false);
  };

  const MySwal = withReactContent(Swal);

  const paginas = [
    { id: 'dashboard', name: 'Tablero' },
    { id: 'usuarios', name: 'Usuarios' },
    { id: 'cursos', name: 'Cursos' },
    { id: 'notas', name: 'Notas' },
    { id: 'reportes', name: 'Reportes' },
    { id: 'configuracion', name: 'Configuración' },
    { id: 'ventas', name: 'Ventas' },
    { id: 'inventario', name: 'Inventario' },
    { id: 'marketing', name: 'Marketing' },
  ];

  const permisos = [
    { id: 'read', name: 'Ver' },
    { id: 'create', name: 'Crear' },
    { id: 'update', name: 'Editar' },
    { id: 'delete', name: 'Eliminar' },
  ];

  const [usuarios, setUsuarios] = useState([
    {
      id: 1,
      nombre: 'Juan Pérez',
      rol: 'Padre',
      permisos: paginas.reduce((acc, pagina) => ({
        ...acc,
        [pagina.id]: { read: true, create: false, update: false, delete: false },
      }), {}),
    },
    {
      id: 2,
      nombre: 'María Docente',
      rol: 'Docente',
      permisos: paginas.reduce((acc, pagina) => ({
        ...acc,
        [pagina.id]: { read: true, create: true, update: true, delete: false },
      }), {}),
    },
    {
      id: 3,
      nombre: 'Admin Sistema',
      rol: 'Admin',
      permisos: paginas.reduce((acc, pagina) => ({
        ...acc,
        [pagina.id]: { read: true, create: true, update: true, delete: true },
      }), {}),
    },
  ]);

  const cambiarPermiso = (usuarioId, paginaId, permisoId) => {
    setUsuarios(usuarios.map(usuario => {
      if (usuario.id === usuarioId) {
        return {
          ...usuario,
          permisos: {
            ...usuario.permisos,
            [paginaId]: {
              ...usuario.permisos[paginaId],
              [permisoId]: !usuario.permisos[paginaId][permisoId],
            },
          },
        };
      }
      return usuario;
    }));
  };

  const guardarCambios = () => {
    MySwal.fire({
      title: '¿Guardar cambios?',
      text: '¿Estás seguro de que quieres guardar los cambios en los permisos?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4CAF50',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Guardar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Guardar los cambios en la base de datos o backend
        MySwal.fire(
          '¡Cambios Guardados!',
          'Los cambios en los permisos han sido guardados.',
          'success'
        );
      }
    });
  };

  return (
    <div className="container">
      <style>{`
        /* Estilos principales */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: 'Inter', sans-serif;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .minimal-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .minimal-table th {
          padding: 12px;
          text-align: left;
          font-weight: 600;
          border-bottom: 1px solid #ddd;
          color: #333;
          background-color: #f6f6f6;
        }

        .minimal-table td {
          padding: 12px;
          border-bottom: 1px solid #f0f0f0;
        }

        .user-cell {
          position: sticky;
          left: 0;
          background: #f6f6f6;
          z-index: 10;
          border-right: 1px solid #ddd;
          min-width: 160px;
        }

        .user-name {
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .permission-cell {
          min-width: 140px;
        }

        .permission-group {
          display: grid;
          gap: 8px;
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
          width: 24px;
          height: 14px;
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
          background-color: #ccc;
          transition: 0.2s;
          border-radius: 14px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 10px;
          width: 10px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          transition: 0.2s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: #4CAF50;
        }

        input:checked + .slider:before {
          transform: translateX(10px);
        }

        .permissions-header {
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .title {
          font-size: 20px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }

        .subtitle {
          color: #666;
          margin: 4px 0 0 0;
          font-size: 14px;
        }

        .table-container {
          overflow-x: auto;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .warning-message {
          background-color: #fffacd;
          padding: 16px;
          border: 1px solid #fff59d;
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
          background-color: #fff9e6;
        }

        .close-button {
          background: transparent;
          border: none;
          color: #333;
          font-weight: bold;
          cursor: pointer;
          font-size: 14px;
          margin-left: 16px;
          transition: color 0.2s;
        }

        .close-button:hover {
          text-decoration: underline;
          color: #ff0000;
        }

        .save-button {
          background-color: #4CAF50;
          border: none;
          color: white;
          padding: 8px 16px;
          text-align: center;
          text-decoration: none;
          display: inline-block;
          font-size: 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .save-button:hover {
          background-color: #45a049;
        }
      `}</style>

      {mostrarAdvertencia && (
        <div className="warning-message">
          <span>
            ADVERTENCIA: MODIFICAR ALGO EN ESTA PÁGINA AFECTARÁ LOS PERMISOS DE OTROS USUARIOS.
          </span>
          <button onClick={cerrarAdvertencia} className="close-button">
            Cerrar
          </button>
        </div>
      )}

      <div className="permissions-header">
        <h1 className="title">{pathName}</h1> {/* Mostrar el nombre de la ruta aquí */}
        <button className="save-button" onClick={guardarCambios}>Guardar Cambios</button>
      </div>

      <div className="table-container">
        <table className="minimal-table">
          <thead>
            <tr>
              <th className="user-cell">Usuario</th>
              {paginas.map(pagina => (
                <th key={pagina.id} className="permission-cell">{pagina.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usuarios.map(usuario => (
              <tr key={usuario.id}>
                <td className="user-cell">
                  <p className="user-name">{usuario.nombre}</p>
                  <p className="permission-label">{usuario.rol}</p>
                </td>
                {paginas.map(pagina => (
                  <td key={pagina.id} className="permission-cell">
                    <div className="permission-group">
                      {permisos.map(permiso => (
                        <div className="permission-row" key={permiso.id}>
                          <label className="permission-label">{permiso.name}</label>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={usuario.permisos[pagina.id][permiso.id]}
                              onChange={() => cambiarPermiso(usuario.id, pagina.id, permiso.id)}
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

export default GestorDePermisos;
