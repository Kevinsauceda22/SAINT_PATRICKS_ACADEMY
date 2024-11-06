import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const GestorDePermisos = ({ pathName }) => {
  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const MySwal = withReactContent(Swal);

  // Mapeo de IDs de rol a nombres
  const rolNombres = {
    1: 'Padre',
    2: 'ADMIN',
    3: 'Docente',
    4: 'Manager'
  };

  // Definición de los objetos del sistema
  const paginas = [
    { id: '12', name: 'Dashboard', description: 'Página del tablero de control' },
    { id: '45', name: 'Gestión Usuarios', description: 'Gestión Usuarios' },
    { id: '46', name: 'Página Principal', description: 'Dashboard para padres' },
    { id: '47', name: 'Lista Asistencia', description: 'Lista Asistencia' },
    { id: '48', name: 'Lista Profesores', description: 'Lista Profesores' },
    { id: '49', name: 'Lista Estado nota', description: 'Lista Estado nota' },
    { id: '50', name: 'Lista Estructura', description: 'Lista Estructura' },
    { id: '51', name: 'Lista Asignaturas', description: 'Lista Asignaturas' },
    { id: '52', name: 'Lista Ciclos', description: 'Lista Ciclos' },
    { id: '53', name: 'Lista Especialidades', description: 'Lista Especialidades' },
    { id: '54', name: 'Lista Estado asistencia', description: 'Lista Estado asistencia' },
    { id: '55', name: 'Lista Grados', description: 'Lista Grados' },
    { id: '56', name: 'Lista Grado Academico', description: 'Lista Grado Academico' },
    { id: '57', name: 'Lista Parciales', description: 'Lista Parciales' },
    { id: '58', name: 'Lista Ponderaciones', description: 'Lista Ponderaciones' },
    { id: '59', name: 'Lista Tipo Contrato', description: 'Lista Tipo Contrato' },
    { id: '60', name: 'Tipo matrícula', description: 'tipo matricula' },
    { id: '61', name: 'Periodo matrícula', description: 'periodo matricula' },
    { id: '62', name: 'Estado matrícula', description: 'estado matricula' },
    { id: '63', name: 'Concepto pago', description: 'concepto pago' },
    { id: '64', name: 'Departamento', description: 'departamento' },
    { id: '65', name: 'Tipo persona', description: 'tipo persona' },
    { id: '66', name: 'Edificios', description: 'edificios' },
    { id: '67', name: 'Días', description: 'dias' },
    { id: '68', name: 'Lista Historico Proc', description: 'Lista Historico Proc' },
    { id: '69', name: 'Lista Relacion', description: 'Lista Relacion' },
    { id: '70', name: 'Contabilidad', description: 'Contabilidad' },
    { id: '71', name: 'Libro Diario', description: 'Libro Diario' },
    { id: '72', name: 'Roles y Permisos', description: 'roles and permissions' },
    { id: '73', name: 'Lista Historial', description: 'Lista Historial' },
    { id: '74', name: 'Actividades', description: 'actividades' },
    { id: '75', name: 'Contabilidad', description: 'Contabilidad' },
    { id: '76', name: 'Login', description: 'Login' }
  ];

  const permisos = [
    { id: 'Permiso_Modulo', name: 'Módulo' },  // Añadido el permiso de módulo
    { id: 'Permiso_Consultar', name: 'Ver' },
    { id: 'Permiso_Insercion', name: 'Crear' },
    { id: 'Permiso_Actualizacion', name: 'Editar' },
    { id: 'Permiso_Eliminacion', name: 'Eliminar' },
  ];

  const cerrarAdvertencia = () => {
    setMostrarAdvertencia(false);
  };

  const cargarPermisos = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/roles/permisos', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar los permisos');
      }

      const data = await response.json();
      const usuariosTransformados = transformarDatosPermisos(data);
      setUsuarios(usuariosTransformados);
      setCargando(false);
    } catch (error) {
      console.error('Error:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los permisos'
      });
      setCargando(false);
    }
  };

  const transformarDatosPermisos = (datosBackend) => {
    const permisosPorRol = datosBackend.reduce((acc, permiso) => {
      if (!acc[permiso.Cod_Rol]) {
        acc[permiso.Cod_Rol] = [];
      }
      acc[permiso.Cod_Rol].push(permiso);
      return acc;
    }, {});

    const rolesCompletos = Object.keys(rolNombres).reduce((acc, rolId) => {
      if (!acc[rolId]) {
        acc[rolId] = [];
      }
      return acc;
    }, {...permisosPorRol});

    return Object.entries(rolesCompletos).map(([rolId, permisosRol]) => {
      return {
        id: parseInt(rolId),
        nombre: rolNombres[rolId] || `Rol ${rolId}`,
        rol: rolNombres[rolId] || `Rol ${rolId}`,
        permisos: paginas.reduce((acc, pagina) => {
          const permisoObjeto = permisosRol.find(p => p.Cod_Objeto.toString() === pagina.id);
          
          return {
            ...acc,
            [pagina.id]: {
              Permiso_Modulo: permisoObjeto?.Permiso_Modulo === "1",
              Permiso_Consultar: permisoObjeto?.Permiso_Consultar === "1",
              Permiso_Insercion: permisoObjeto?.Permiso_Insercion === "1",
              Permiso_Actualizacion: permisoObjeto?.Permiso_Actualizacion === "1",
              Permiso_Eliminacion: permisoObjeto?.Permiso_Eliminacion === "1",
            }
          };
        }, {})
      };
    });
  };

  useEffect(() => {
    cargarPermisos();
  }, []);


  const cambiarPermiso = async (Cod_usuario, Cod_Objeto, Cod_Permiso) => {
    try {
      const usuario = usuarios.find(u => u.id === Cod_usuario);
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }
  
      const permisosObjeto = usuario.permisos[Cod_Objeto];
      if (!permisosObjeto) {
        throw new Error('Permisos del objeto no encontrados');
      }
  
      const permisoActual = permisosObjeto[Cod_Permiso];
      
      // Preparar objeto de actualizaciones
      const actualizaciones = {};
  
      // Si estamos cambiando el Permiso_Modulo
      if (Cod_Permiso === 'Permiso_Modulo') {
        // Si estamos desactivando el módulo, todos los permisos se ponen en 0
        if (permisoActual) {
          actualizaciones.Permiso_Modulo = "0";
          actualizaciones.Permiso_Consultar = "0";
          actualizaciones.Permiso_Insercion = "0";
          actualizaciones.Permiso_Actualizacion = "0";
          actualizaciones.Permiso_Eliminacion = "0";
        } else {
          // Si estamos activando el módulo, solo activamos el módulo
          actualizaciones.Permiso_Modulo = "1";
        }
      } else {
        // Si el módulo está desactivado, no permitimos cambiar otros permisos
        if (!permisosObjeto.Permiso_Modulo) {
          MySwal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'Debe activar primero el permiso del módulo'
          });
          return;
        }
        // Mantener los permisos actuales y solo cambiar el específico
        actualizaciones.Permiso_Modulo = permisosObjeto.Permiso_Modulo ? "1" : "0";
        actualizaciones.Permiso_Consultar = permisosObjeto.Permiso_Consultar ? "1" : "0";
        actualizaciones.Permiso_Insercion = permisosObjeto.Permiso_Insercion ? "1" : "0";
        actualizaciones.Permiso_Actualizacion = permisosObjeto.Permiso_Actualizacion ? "1" : "0";
        actualizaciones.Permiso_Eliminacion = permisosObjeto.Permiso_Eliminacion ? "1" : "0";
        actualizaciones[Cod_Permiso] = !permisoActual ? "1" : "0";
      }
  
      // Crear el objeto de datos para enviar al backend
      const datosActualizacion = {
        Cod_Objeto: parseInt(Cod_Objeto),
        Cod_Rol: Cod_usuario,
        ...actualizaciones
      };
  
      console.log('Enviando actualización:', datosActualizacion);
  
      const response = await fetch(`http://localhost:4000/api/roles/permisos/estado/${Cod_Permiso}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(datosActualizacion)
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
  
      // Actualizar el estado local
      setUsuarios(usuarios.map(usuario => {
        if (usuario.id === Cod_usuario) {
          return {
            ...usuario,
            permisos: {
              ...usuario.permisos,
              [Cod_Objeto]: {
                ...usuario.permisos[Cod_Objeto],
                ...actualizaciones
              },
            },
          };
        }
        return usuario;
      }));
  
      MySwal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Permiso actualizado correctamente',
        timer: 1500,
        showConfirmButton: false
      });
  
    } catch (error) {
      console.error('Error:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo actualizar el permiso'
      });
    }
  };
  
  const guardarCambios = async () => {
    try {
      const result = await MySwal.fire({
        title: '¿Guardar cambios?',
        text: '¿Estás seguro de que quieres guardar los cambios en los permisos?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#4CAF50',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await cargarPermisos(); // Recargar los permisos desde el servidor

        MySwal.fire({
          icon: 'success',
          title: '¡Cambios Guardados!',
          text: 'Los cambios en los permisos han sido guardados.',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron guardar los cambios'
      });
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <style>{`
        .warning-message {
          background-color: #fff3cd;
          border: 1px solid #ffeeba;
          color: #856404;
          padding: 1rem;
          margin-bottom: 1rem;
          border-radius: 0.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .close-button {
          background-color: transparent;
          border: none;
          color: #856404;
          cursor: pointer;
          padding: 0.5rem;
        }

        .permissions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .title {
          font-size: 1.5rem;
          font-weight: bold;
          color: #2d3748;
        }

        .subtitle {
          color: #718096;
          margin-top: 0.5rem;
        }

        .save-button {
          background-color: #4CAF50;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.375rem;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.2s;
        }

        .save-button:hover {
          background-color: #45a049;
        }

        .table-container {
          overflow-x: auto;
          margin-top: 1rem;
          background-color: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .minimal-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }

        .minimal-table th,
        .minimal-table td {
          padding: 1rem;
          border: 1px solid #e2e8f0;
        }

        .minimal-table th {
          background-color: #f8fafc;
          font-weight: 600;
          text-align: left;
          color: #4a5568;
        }

        .user-cell {
          min-width: 200px;
          background-color: #f8fafc;
        }

        .permission-cell {
          min-width: 150px;
        }

        .user-name {
          font-weight: 600;
          color: #2d3748;
        }

        .permission-label {
          color: #718096;
          font-size: 0.875rem;
        }

        .permission-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .permission-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* Switch styles */
        .switch {
          position: relative;
          display: inline-block;
          width: 40px;
          height: 20px;
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
          transition: .4s;
          border-radius: 20px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: #4CAF50;
        }

        input:checked + .slider:before {
          transform: translateX(20px);
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
        <div>
          <h1 className="title">{pathName}</h1>
          <p className="subtitle">Gestión de permisos por módulo y rol</p>
        </div>
        <button className="save-button" onClick={guardarCambios}>
          Guardar Cambios
        </button>
      </div>

      <div className="table-container">
        <table className="minimal-table">
          <thead>
            <tr>
              <th className="user-cell">Usuario</th>
              {paginas.map(pagina => (
                <th key={pagina.id} className="permission-cell" title={pagina.description}>
                  {pagina.name}
                </th>
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
                              checked={usuario.permisos[pagina.id]?.[permiso.id] || false}
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