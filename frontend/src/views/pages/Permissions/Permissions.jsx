import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilBrushAlt } from '@coreui/icons';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied"

const GestorDePermisos = ({ pathName }) => {
  const { canSelect, canUpdate, canDelete, canInsert, loading, error } = usePermission('rolesandpermissions');

  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busquedaObjeto, setBusquedaObjeto] = useState('');
  const [busquedaRol, setBusquedaRol] = useState('');
  const [vistaActual, setVistaActual] = useState('general');
  const MySwal = withReactContent(Swal);

  const rolNombres = {
    1: 'Padre',
    2: 'Administrador',
    3: 'Docente',
    4: 'Manager'
  };

  const paginasGenerales = [
    { id: '12', name: 'Dashboard', description: 'Página del tablero de control' },
    { id: '46', name: 'Dashboard Padres', description: 'Dashboard para padres' },
    { id: '47', name: 'Lista Asistencia', description: 'ListaAsistencia' },
    { id: '84', name: 'Asistencia Profesor', description: 'ListaAsistenciaProfesor' },
    { id: '85', name: 'Notas Profesor', description: 'ListaNotasProfesor' },
    { id: '87', name: 'Notas', description: 'ListaNotas' },
    { id: '88', name: 'Grados-Asignaturas', description: 'ListaGradosAsignaturas' },
    { id: '89', name: 'Ponderaciones-Ciclos', description: 'ListaPonderacionesCiclos' },
    { id: '48', name: 'Lista Profesores', description: 'Lista Profesores' },
    { id: '73', name: 'Lista Historial', description: 'Lista Historial' },
    { id: '74', name: 'Actividades', description: 'actividades' },
    { id: '77', name: 'Matricula', description: 'Matricula' },
    { id: '79', name: 'Actividades Academicas Vista Admin', description: 'ListaActividadesAca' },
    { id: '90', name: 'Solicitudes Administrador', description: 'Solicitud_admin' },
    { id: '91', name: 'Solicitudes Padre', description: 'Solicitudes_Padre' },
    { id: '93', name: 'ListaSecciones Asignatura', description: 'ListaSecciones' },
    { id: '95', name: 'Lista Parametro', description: 'ListaParametro' },
    { id: '98', name: 'Cuadro Profesor', description: 'ListaCuadroProfesor' },
    { id: '99', name: 'Cuadro', description: 'ListaCuadro' },
    { id: '96', name: 'Gestion Academica', description: 'GestionAca' },
    { id: '97', name: 'Secciones', description: 'GestionAca' }


  ];

  const paginasPagos = [
    { id: '71', name: 'Libro Diario', description: 'Libro Diario' }
  ];

  const paginasPersonas = [
    { id: '80', name: 'Personas', description: 'ListaPersonas' },
    { id: '69', name: 'Lista Relacion', description: 'Lista Relacion' },
    { id: '65', name: 'Tipo persona', description: 'tipo persona' },
    { id: '64', name: 'Departamento', description: 'departamento' },
    { id: '81', name: 'Municipios', description: 'Muinicipios' }
  ];

  const paginasUsuarios = [
    { id: '45', name: 'Admin. de Usuarios', description: 'Gestión Usuarios' },
    { id: '72', name: 'Roles y Permisos', description: 'roles and permissions' }
  ];

  const paginasMantenimiento = [
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
    { id: '66', name: 'Edificios', description: 'edificios' },
    { id: '67', name: 'Días', description: 'dias' },
    { id: '68', name: 'Lista Historico Proc', description: 'Lista Historico Proc' },
    { id: '70', name: 'Contabilidad', description: 'Contabilidad' }
    
  ];

  const permisos = [
    { id: 'Permiso_Modulo', name: 'Módulo' },
    { id: 'Permiso_Consultar', name: 'Ver' },
    { id: 'Permiso_Insercion', name: 'Crear' },
    { id: 'Permiso_Actualizacion', name: 'Editar' },
    { id: 'Permiso_Eliminacion', name: 'Eliminar' },
    { id: 'Permiso_Nav', name: 'Mostrar en Nav' }
  ];

  const getPaginasActuales = () => {
    switch (vistaActual) {
      case 'mantenimiento':
        return paginasMantenimiento;
      case 'pagos':
        return paginasPagos;
      case 'personas':
        return paginasPersonas;
      case 'usuarios':
        return paginasUsuarios;
      default:
        return paginasGenerales;
    }
  };
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
      const paginasActuales = getPaginasActuales();
      return {
        id: parseInt(rolId),
        nombre: rolNombres[rolId] || `Rol ${rolId}`,
        rol: rolNombres[rolId] || `Rol ${rolId}`,
        permisos: paginasActuales.reduce((acc, pagina) => {
          const permisoObjeto = permisosRol.find(p => p.Cod_Objeto.toString() === pagina.id);
          
          return {
            ...acc,
            [pagina.id]: {
              Permiso_Modulo: permisoObjeto?.Permiso_Modulo === "1",
              Permiso_Consultar: permisoObjeto?.Permiso_Consultar === "1",
              Permiso_Insercion: permisoObjeto?.Permiso_Insercion === "1",
              Permiso_Actualizacion: permisoObjeto?.Permiso_Actualizacion === "1",
              Permiso_Eliminacion: permisoObjeto?.Permiso_Eliminacion === "1",
              Permiso_Nav: permisoObjeto?.Permiso_Nav === "1"
            }
          };
        }, {})
      };
    });
  };

  useEffect(() => {
    cargarPermisos();
  }, [vistaActual]);

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
      const actualizaciones = {};
  
      if (Cod_Permiso === 'Permiso_Modulo') {
        // Si estamos desactivando el módulo
        if (permisoActual) {
          actualizaciones.Permiso_Modulo = "0";
          actualizaciones.Permiso_Consultar = "0";
          actualizaciones.Permiso_Insercion = "0";
          actualizaciones.Permiso_Actualizacion = "0";
          actualizaciones.Permiso_Eliminacion = "0";
          // NO desactivamos Permiso_Nav aquí
        } else {
          actualizaciones.Permiso_Modulo = "1";
        }
      } else if (Cod_Permiso === 'Permiso_Nav') {
        // Permiso_Nav puede cambiarse independientemente del estado del módulo
        actualizaciones.Permiso_Nav = !permisoActual ? "1" : "0";
      } else {
        // Para otros permisos, mantener la validación del módulo
        if (!permisosObjeto.Permiso_Modulo) {
          MySwal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'Debe activar primero el permiso del módulo'
          });
          return;
        }
        // Mantener los permisos actuales
        actualizaciones.Permiso_Modulo = permisosObjeto.Permiso_Modulo ? "1" : "0";
        actualizaciones.Permiso_Consultar = permisosObjeto.Permiso_Consultar ? "1" : "0";
        actualizaciones.Permiso_Insercion = permisosObjeto.Permiso_Insercion ? "1" : "0";
        actualizaciones.Permiso_Actualizacion = permisosObjeto.Permiso_Actualizacion ? "1" : "0";
        actualizaciones.Permiso_Eliminacion = permisosObjeto.Permiso_Eliminacion ? "1" : "0";
        actualizaciones.Permiso_Nav = permisosObjeto.Permiso_Nav ? "1" : "0"; // Mantener el estado actual
        actualizaciones[Cod_Permiso] = !permisoActual ? "1" : "0";
      }
  
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
        await cargarPermisos();

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

  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.nombre.toLowerCase().includes(busquedaRol.toLowerCase()) ||
    usuario.rol.toLowerCase().includes(busquedaRol.toLowerCase())
  );

  const paginasActuales = getPaginasActuales();

  if (cargando) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (!canSelect) {
    return <AccessDenied />;
  }

  return (
    <div className="permisos-container">
      <style>
        {`
          .permisos-container {
            padding: 2rem;
            max-width: 100%;
            margin: 0 auto;
          }

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
            background: none;
            border: none;
            color: #856404;
            cursor: pointer;
            padding: 0.5rem;
          }

          .header-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
          }

          .title-section h1 {
            font-size: 1.5rem;
            font-weight: bold;
            color: #2d3748;
            margin: 0;
          }

          .title-section p {
            color: #718096;
            margin-top: 0.5rem;
          }

          .control-section {
            display: flex;
            gap: 1rem;
            align-items: center;
            flex-wrap: wrap;
          }

          .search-container {
            position: relative;
            width: 300px;
          }

          .search-input {
            width: 100%;
            padding: 0.5rem 1rem 0.5rem 2.5rem;
            border: 1px solid #e2e8f0;
            border-radius: 0.375rem;
          }

          .search-icon {
            position: absolute;
            left: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            color: #718096;
          }

          .view-toggle {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
          }

          .view-button {
            padding: 0.75rem 1.5rem;
            border: 1px solid #e2e8f0;
            border-radius: 0.375rem;
            background-color: white;
            cursor: pointer;
            transition: all 0.2s;
            white-space: nowrap;
            font-weight: 500;
          }

          .view-button.active {
            background-color: #4CAF50;
            color: white;
            border-color: #4CAF50;
          }

          .save-button {
            padding: 0.75rem 1.5rem;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 0.375rem;
            cursor: pointer;
            font-weight: 600;
          }

          .save-button:hover {
            background-color: #45a049;
          }

          .table-container {
            overflow-x: auto;
            margin-top: 1rem;
            background-color: white;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }

          .permisos-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 800px;
          }

          .permisos-table th,
          .permisos-table td {
            padding: 1rem;
            border: 1px solid #e2e8f0;
          }

          .permisos-table th {
            background-color: #f8fafc;
            font-weight: 600;
            text-align: left;
            color: #4a5568;
          }

          .user-cell {
            background-color: #f8fafc;
            min-width: 200px;
          }

          .user-name {
            font-weight: 600;
            color: #2d3748;
            margin: 0;
          }

          .user-role {
            color: #718096;
            font-size: 0.875rem;
            margin: 0;
          }

          .permission-cell {
            min-width: 150px;
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

          .permission-label {
            color: #718096;
            font-size: 0.875rem;
          }

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

          @media (max-width: 768px) {
            .control-section {
              flex-direction: column;
            }
            
            .search-container {
              width: 100%;
            }

            .view-toggle {
              width: 100%;
            }

            .view-button {
              flex: 1;
            }
          }
        `}
      </style>

      {mostrarAdvertencia && (
        <div className="warning-message">
          <span>
            ADVERTENCIA: MODIFICAR ALGO EN ESTA PÁGINA AFECTARÁ LOS PERMISOS DE OTROS USUARIOS.
          </span>
          <button onClick={cerrarAdvertencia} className="close-button">
            ×
          </button>
        </div>
      )}

      <div className="header-container">
        <div className="title-section">
          <h1>{pathName}</h1>
          <p>Gestión de permisos por módulo y rol</p>
        </div>
        
        <div className="control-section">
          <div className="search-container">
            <CIcon icon={cilSearch} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar por rol..."
              value={busquedaRol}
              onChange={(e) => setBusquedaRol(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="view-toggle">
            <button
              className={`view-button ${vistaActual === 'general' ? 'active' : ''}`}
              onClick={() => setVistaActual('general')}
            >
              General
            </button>
            <button
              className={`view-button ${vistaActual === 'mantenimiento' ? 'active' : ''}`}
              onClick={() => setVistaActual('mantenimiento')}
            >
              Mantenimiento
            </button>
            <button
              className={`view-button ${vistaActual === 'pagos' ? 'active' : ''}`}
              onClick={() => setVistaActual('pagos')}
            >
              Pagos y Finanzas
            </button>
            <button
              className={`view-button ${vistaActual === 'personas' ? 'active' : ''}`}
              onClick={() => setVistaActual('personas')}
            >
              Personas
            </button>
            <button
              className={`view-button ${vistaActual === 'usuarios' ? 'active' : ''}`}
              onClick={() => setVistaActual('usuarios')}
            >
              Usuarios
            </button>
          </div>

          <button className="save-button" onClick={guardarCambios}>
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="permisos-table">
          <thead>
            <tr>
              <th className="user-cell">Usuario</th>
              {paginasActuales.map(pagina => (
                <th key={pagina.id} className="permission-cell" title={pagina.description}>
                  {pagina.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map(usuario => (
              <tr key={usuario.id}>
   <td className="user-cell">
  <div className="user-info-container">
    <div className="user-info-header">
      <p className="user-name">{usuario.nombre}</p>
      <p className="user-role">{usuario.rol}</p>
    </div>
    <div className="sidebar-permission">
      <span className="permission-label">Mostrar en el Nav</span>
      <label className="switch">
        <input
          type="checkbox"
          checked={usuario.permisos['global']?.Permiso_Nav || false}
          onChange={() => cambiarPermiso(usuario.id, 'global', 'Permiso_Nav')}
        />
        <span className="slider"></span>
      </label>
    </div>
  </div>
</td>

                {paginasActuales.map(pagina => (
                  <td key={pagina.id} className="permission-cell">
                    <div className="permission-group">
                      {permisos.map(permiso => (
                        <div className="permission-row" key={permiso.id}>
                          <span className="permission-label">{permiso.name}</span>
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
