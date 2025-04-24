import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import CIcon from '@coreui/icons-react';
import { cilSearch, cilFilter, cilSettings, cilUser, cilBrushAlt } from '@coreui/icons';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied";
import { 
  CCard, CCardHeader, CCardBody, CNav, CNavItem, CNavLink, 
  CButton, CInputGroup, CFormInput, CCollapse, CCardTitle 
} from '@coreui/react';

const GestorDePermisos = ({ pathName }) => {
  const { canSelect, canUpdate, canDelete, canInsert, loading, error } = usePermission('rolesandpermissions');

  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busquedaObjeto, setBusquedaObjeto] = useState('');
  const [busquedaRol, setBusquedaRol] = useState('');
  const [vistaActual, setVistaActual] = useState('general');
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [visibleSections, setVisibleSections] = useState({});
  const MySwal = withReactContent(Swal);

  const rolNombres = {
    1: 'Padre',
    2: 'Administrador',
    3: 'Docente',
    4: 'Manager',
    5: 'Estudiante'
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
    { id: '96', name: 'Gestion Academica', description: 'GestionAca' },
    { id: '97', name: 'Secciones', description: 'GestionAca' }
  ];

  const paginasPagos = [
    { id: '71', name: 'Libro Diario', description: 'Libro Diario' },
    { id: '98', name: 'Reportes Financieros', description: 'Reportes de pagos y finanzas' },
    { id: '99', name: 'Facturación', description: 'Sistema de facturación' }
  ];

  const paginasPersonas = [
    { id: '80', name: 'Personas', description: 'ListaPersonas' },
    { id: '69', name: 'Lista Relacion', description: 'Lista Relacion' },
    { id: '65', name: 'Tipo persona', description: 'tipo persona' },
    { id: '64', name: 'Departamento', description: 'departamento' },
    { id: '81', name: 'Municipios', description: 'Muinicipios' },
    { id: '100', name: 'Contactos de Emergencia', description: 'Contactos importantes' }
  ];

  const paginasUsuarios = [
    { id: '45', name: 'Admin. de Usuarios', description: 'Gestión Usuarios' },
    { id: '72', name: 'Roles y Permisos', description: 'roles and permissions' },
    { id: '101', name: 'Perfiles de Usuario', description: 'Gestión de perfiles' }
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
    { id: '70', name: 'Contabilidad', description: 'Contabilidad' },
    { id: '102', name: 'Configuración del Sistema', description: 'Ajustes generales' }
  ];

  const permisos = [
    { id: 'Permiso_Modulo', name: 'Módulo' },
    { id: 'Permiso_Consultar', name: 'Ver' },
    { id: 'Permiso_Insercion', name: 'Crear' },
    { id: 'Permiso_Actualizacion', name: 'Editar' },
    { id: 'Permiso_Eliminacion', name: 'Eliminar' },
    { id: 'Permiso_Nav', name: 'Mostrar en Nav' },
    { id: 'Permiso_Reportes', name: 'Generar Reportes' }
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
      
      if (!rolSeleccionado && usuariosTransformados.length > 0) {
        setRolSeleccionado(usuariosTransformados[0].id);
      }
      
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
              Permiso_Nav: permisoObjeto?.Permiso_Nav === "1",
              Permiso_Reportes: permisoObjeto?.Permiso_Reportes === "1"
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
        if (permisoActual) {
          actualizaciones.Permiso_Modulo = "0";
          actualizaciones.Permiso_Consultar = "0";
          actualizaciones.Permiso_Insercion = "0";
          actualizaciones.Permiso_Actualizacion = "0";
          actualizaciones.Permiso_Eliminacion = "0";
          actualizaciones.Permiso_Reportes = "0";
        } else {
          actualizaciones.Permiso_Modulo = "1";
        }
      } else if (Cod_Permiso === 'Permiso_Nav') {
        actualizaciones.Permiso_Nav = !permisoActual ? "1" : "0";
      } else {
        if (!permisosObjeto.Permiso_Modulo) {
          MySwal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'Debe activar primero el permiso del módulo'
          });
          return;
        }
        
        actualizaciones.Permiso_Modulo = permisosObjeto.Permiso_Modulo ? "1" : "0";
        actualizaciones.Permiso_Consultar = permisosObjeto.Permiso_Consultar ? "1" : "0";
        actualizaciones.Permiso_Insercion = permisosObjeto.Permiso_Insercion ? "1" : "0";
        actualizaciones.Permiso_Actualizacion = permisosObjeto.Permiso_Actualizacion ? "1" : "0";
        actualizaciones.Permiso_Eliminacion = permisosObjeto.Permiso_Eliminacion ? "1" : "0";
        actualizaciones.Permiso_Nav = permisosObjeto.Permiso_Nav ? "1" : "0";
        actualizaciones.Permiso_Reportes = permisosObjeto.Permiso_Reportes ? "1" : "0";
        actualizaciones[Cod_Permiso] = !permisoActual ? "1" : "0";
      }
  
      const datosActualizacion = {
        Cod_Objeto: parseInt(Cod_Objeto),
        Cod_Rol: Cod_usuario,
        ...actualizaciones
      };
  
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
  
      await response.json();
  
      setUsuarios(usuarios.map(usuario => {
        if (usuario.id === Cod_usuario) {
          return {
            ...usuario,
            permisos: {
              ...usuario.permisos,
              [Cod_Objeto]: {
                ...usuario.permisos[Cod_Objeto],
                ...Object.fromEntries(Object.entries(actualizaciones).map(([key, value]) => [key, value === "1"]))
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

  // Ordenar roles alfabéticamente por nombre
  const usuariosFiltrados = usuarios
    .filter(usuario =>
      usuario.nombre.toLowerCase().includes(busquedaRol.toLowerCase()) ||
      usuario.rol.toLowerCase().includes(busquedaRol.toLowerCase())
    )
    .sort((a, b) => a.nombre.localeCompare(b.nombre));

  // Ordenar páginas alfabéticamente por nombre
  const paginasActuales = getPaginasActuales()
    .filter(pagina => 
      pagina.name.toLowerCase().includes(busquedaObjeto.toLowerCase()) ||
      pagina.description.toLowerCase().includes(busquedaObjeto.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const usuarioActual = usuarios.find(u => u.id === rolSeleccionado);

  const toggleSection = (sectionId) => {
    setVisibleSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

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
            padding: 1rem;
            max-width: 100%;
            margin: 0 auto;
          }
          
          .warning-message {
            background-color: #fff3cd;
            border: 1px solid #ffeeba;
            color: #856404;
            padding: 0.75rem;
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
            padding: 0.25rem;
          }
          
          .header-container {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
          }
          
          .title-section h1 {
            font-size: 1.5rem;
            font-weight: bold;
            color: #2d3748;
            margin: 0;
          }
          
          .title-section p {
            color: #718096;
            margin-top: 0.25rem;
          }

          .control-section {
            display: flex;
            gap: 0.5rem;
          }

          .roles-sidebar {
            width: 250px;
            flex-shrink: 0;
            margin-right: 1rem;
          }
          
          .role-button {
            width: 100%;
            text-align: left;
            padding: 0.75rem;
            margin-bottom: 0.5rem;
            border: 1px solid #e2e8f0;
            border-radius: 0.375rem;
            background-color: white;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .role-button.active {
            background-color: #4CAF50;
            color: white;
            border-color: #4CAF50;
          }
          
          .role-name {
            font-weight: 600;
          }
          
          .role-type {
            font-size: 0.8rem;
            opacity: 0.8;
          }

          .main-content {
            flex-grow: 1;
          }

          .category-tabs {
            margin-bottom: 1rem;
          }

          .pages-section {
            margin-bottom: 1rem;
          }

          .page-card {
            padding: 1rem;
          }

          .page-title {
            font-weight: 600;
            margin-bottom: 0.5rem;
          }
          
          .page-description {
            font-size: 0.8rem;
            color: #718096;
            margin-bottom: 0.75rem;
          }
          
          .permission-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.5rem 0;
            border-bottom: 1px solid #f0f0f0;
          }

          .permission-row:last-child {
            border-bottom: none;
          }
          
          .permission-label {
            font-weight: 500;
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

          .save-button {
            padding: 0.75rem 1.5rem;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 0.375rem;
            cursor: pointer;
            font-weight: 600;
            margin-top: 1rem;
          }
          
          .save-button:hover {
            background-color: #45a049;
          }
          
          .no-selection-message {
            text-align: center;
            padding: 2rem;
            color: #718096;
          }
          
          @media (max-width: 992px) {
            .layout-container {
              flex-direction: column;
            }
            
            .roles-sidebar {
              width: 100%;
              margin-right: 0;
              margin-bottom: 1rem;
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
          <CButton color="success" onClick={guardarCambios}>
            Guardar Cambios
          </CButton>
        </div>
      </div>

      <div className="layout-container d-flex">
        {/* Panel de Roles (Izquierda) */}
        <div className="roles-sidebar">
          <CInputGroup className="mb-3">
            <CFormInput 
              placeholder="Buscar rol..."
              value={busquedaRol}
              onChange={(e) => setBusquedaRol(e.target.value)}
            />
          </CInputGroup>
          
          {usuariosFiltrados.map(usuario => (
            <button
              key={usuario.id}
              className={`role-button ${usuario.id === rolSeleccionado ? 'active' : ''}`}
              onClick={() => setRolSeleccionado(usuario.id)}
            >
              <div className="role-name">{usuario.nombre}</div>
              <div className="role-type">{usuario.rol}</div>
            </button>
          ))}
        </div>

        {/* Contenido Principal (Derecha) */}
        <div className="main-content">
          {/* Pestañas de categorías */}
          <CNav variant="tabs" className="category-tabs">
            <CNavItem>
              <CNavLink 
                active={vistaActual === 'general'} 
                onClick={() => setVistaActual('general')}
              >
                General
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink 
                active={vistaActual === 'mantenimiento'} 
                onClick={() => setVistaActual('mantenimiento')}
              >
                Mantenimiento
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink 
                active={vistaActual === 'pagos'} 
                onClick={() => setVistaActual('pagos')}
              >
                Pagos y Finanzas
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink 
                active={vistaActual === 'personas'} 
                onClick={() => setVistaActual('personas')}
              >
                Personas
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink 
                active={vistaActual === 'usuarios'} 
                onClick={() => setVistaActual('usuarios')}
              >
                Usuarios
              </CNavLink>
            </CNavItem>
          </CNav>

          {/* Campo de búsqueda de objetos/páginas */}
          <CInputGroup className="mb-3">
            <CFormInput 
              placeholder="Buscar página o módulo..."
              value={busquedaObjeto}
              onChange={(e) => setBusquedaObjeto(e.target.value)}
            />
          </CInputGroup>

          {rolSeleccionado && usuarioActual ? (
            <div className="pages-section">
              {paginasActuales.map(pagina => (
                <CCard key={pagina.id} className="mb-2">
                  <CCardHeader 
                    onClick={() => toggleSection(pagina.id)} 
                    style={{ cursor: 'pointer' }}
                  >
                    <CCardTitle>{pagina.name}</CCardTitle>
                  </CCardHeader>
                  <CCollapse visible={visibleSections[pagina.id]}>
                    <CCardBody className="page-card">
                      <div className="page-title">{pagina.name}</div>
                      <div className="page-description">{pagina.description}</div>
                      {permisos.map(permiso => (
                        <div className="permission-row" key={permiso.id}>
                          <span className="permission-label">{permiso.name}</span>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={usuarioActual.permisos[pagina.id]?.[permiso.id] || false}
                              onChange={() => cambiarPermiso(usuarioActual.id, pagina.id, permiso.id)}
                            />
                            <span className="slider"></span>
                          </label>
                        </div>
                      ))}
                    </CCardBody>
                  </CCollapse>
                </CCard>
              ))}
            </div>
          ) : (
            <div className="no-selection-message">
              Selecciona un rol para comenzar la configuración
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GestorDePermisos;