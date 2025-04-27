import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import usePermission from '../../../../context/usePermission';
import AccessDenied from "../AccessDenied/AccessDenied";
import { 
  CCard, CCardHeader, CCardBody, CNav, CNavItem, CNavLink, 
  CButton, CInputGroup, CFormInput, CCollapse, CCardTitle 
} from '@coreui/react';

const GestorDePermisos = ({ pathName }) => {
  // ==================== ESTADOS ====================
  const { canSelect } = usePermission('rolesandpermissions');
  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busquedaObjeto, setBusquedaObjeto] = useState('');
  const [busquedaRol, setBusquedaRol] = useState('');
  const [vistaActual, setVistaActual] = useState('general');
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [visibleSections, setVisibleSections] = useState({});
  const MySwal = withReactContent(Swal);

  // ==================== DATOS EN ORDEN EXACTO ====================
  const rolesOrdenados = [
    { id: 2, nombre: 'Administrador' },
    { id: 3, nombre: 'Docente' },
    { id: 4, nombre: 'Manager' },
    { id: 1, nombre: 'Padre' }
  ];

  const categorias = {
    general: [
      { id: '12', name: 'Dashboard', description: 'Panel principal del sistema' },
      { id: '96', name: 'Agrupador de Secciones', description: 'Organización de grupos académicos' },
      { id: '77', name: 'Matrícula', description: 'Gestión del proceso de matrícula' },
      { id: '88', name: 'Grados y Asignatura', description: 'Administración de grados y asignaturas' },
      { id: '89', name: 'Ponderaciones por Ciclo', description: 'Configuración de ponderaciones académicas' },
      { id: '48', name: 'Profesores', description: 'Gestión de profesores' },
      { id: '47', name: 'Asistencias', description: 'Registro y control de asistencias' },
      { id: '74', name: 'Actividades Académicas', description: 'Gestión de actividades académicas' },
      { id: '87', name: 'Notas Generales', description: 'Administración general de notas' },
      { id: '85', name: 'Cuadro de Notas (General)', description: 'Visualización de cuadros de notas' },
      { id: '90', name: 'Solucitudes Administrativas', description: 'Gestión de solicitudes administrativas' }
    ],
    personas: [
      { id: '80', name: 'Personas', description: 'Gestión de personas en el sistema' },
      { id: '69', name: 'Tipo de Relaciones', description: 'Tipos de relaciones entre personas' },
      { id: '65', name: 'Tipo de Persona', description: 'Clasificación de tipos de personas' },
      { id: '64', name: 'Tipo de Documentos', description: 'Tipos de documentos de identidad' },
      { id: '81', name: 'Departamentos', description: 'Gestión de departamentos geográficos' },
      { id: '82', name: 'Municipios', description: 'Gestión de municipios' },
      { id: '83', name: 'Nacionalidades', description: 'Registro de nacionalidades' },
      { id: '84', name: 'Tipo Contacto', description: 'Tipos de información de contacto' },
      { id: '86', name: 'Género Persona', description: 'Gestión de géneros' }
    ],
    mantenimiento: [
      { id: '49', name: 'Parámetros', description: 'Configuración de parámetros del sistema' },
      { id: '51', name: 'Asignaturas', description: 'Gestión de asignaturas académicas' },
      { id: '52', name: 'Ciclos', description: 'Administración de ciclos académicos' },
      { id: '53', name: 'Especialidades', description: 'Gestión de especialidades' },
      { id: '54', name: 'Estados Asistencia', description: 'Configuración de estados de asistencia' },
      { id: '55', name: 'Estados Nota', description: 'Configuración de estados de notas' },
      { id: '56', name: 'Grados', description: 'Gestión de grados' },
      { id: '57', name: 'Grados Académicos', description: 'Administración de niveles académicos' },
      { id: '58', name: 'Parciales', description: 'Configuración de períodos parciales' },
      { id: '59', name: 'Ponderaciones', description: 'Gestión de ponderaciones' },
      { id: '60', name: 'Tipos de Contratos', description: 'Tipos de contratos laborales' },
      { id: '61', name: 'Historiales Académicos', description: 'Registro de historiales' },
      { id: '62', name: 'Institutos', description: 'Gestión de institutos' },
      { id: '63', name: 'Tipo Matrícula', description: 'Tipos de matrícula' },
      { id: '64', name: 'Periodo Matrícula', description: 'Períodos de matrícula' },
      { id: '65', name: 'Estado Matrícula', description: 'Estados de matrícula' },
      { id: '66', name: 'Concepto Pago', description: 'Conceptos de pago' },
      { id: '67', name: 'Edificios', description: 'Gestión de edificios' },
      { id: '68', name: 'Aulas', description: 'Administración de aulas' },
      { id: '70', name: 'Cuentas Contables', description: 'Configuración contable' }
    ],
    usuarios: [
      { id: '45', name: 'Permisos', description: 'Registro de actividades del sistema' },
      { id: '72', name: 'Gestión de Usuarios y Roles', description: 'Administración de usuarios y permisos' },

    ]
  };

  const permisos = [
    { id: 'Permiso_Modulo', name: 'Módulo' },
    { id: 'Permiso_Consultar', name: 'Ver' },
    { id: 'Permiso_Insercion', name: 'Crear' },
    { id: 'Permiso_Actualizacion', name: 'Editar' },
    { id: 'Permiso_Eliminacion', name: 'Eliminar' },
    { id: 'Permiso_Nav', name: 'Mostrar en Nav' },
    { id: 'Permiso_Reportes', name: 'Generar Reportes' }
  ];

  // ==================== FUNCIONES PRINCIPALES ====================
  const cargarPermisos = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/roles/permisos', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Error al cargar permisos');

      const data = await response.json();
      
      const usuariosActualizados = rolesOrdenados.map(rol => {
        const permisosRol = data.filter(p => p.Cod_Rol === rol.id);
        return {
          ...rol,
          permisos: permisosRol.reduce((acc, permiso) => ({
            ...acc,
            [permiso.Cod_Objeto]: {
              Permiso_Modulo: permiso.Permiso_Modulo === "1",
              Permiso_Consultar: permiso.Permiso_Consultar === "1",
              Permiso_Insercion: permiso.Permiso_Insercion === "1",
              Permiso_Actualizacion: permiso.Permiso_Actualizacion === "1",
              Permiso_Eliminacion: permiso.Permiso_Eliminacion === "1",
              Permiso_Nav: permiso.Permiso_Nav === "1",
              Permiso_Reportes: permiso.Permiso_Reportes === "1"
            }
          }), {})
        };
      });

      setUsuarios(usuariosActualizados);
      if (!rolSeleccionado && usuariosActualizados.length > 0) {
        setRolSeleccionado(usuariosActualizados[0].id);
      }
      setCargando(false);
    } catch (error) {
      console.error('Error:', error);
      MySwal.fire({ icon: 'error', title: 'Error', text: error.message });
      setCargando(false);
    }
  };

  const cambiarPermiso = async (rolId, objetoId, permisoId) => {
    try {
      const usuario = usuarios.find(u => u.id === rolId);
      const nuevoEstado = !usuario.permisos[objetoId]?.[permisoId];

      const response = await fetch(`http://localhost:4000/api/roles/permisos/estado/${permisoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          Cod_Rol: rolId,
          Cod_Objeto: objetoId,
          [permisoId]: nuevoEstado ? "1" : "0"
        })
      });

      if (!response.ok) throw new Error('Error al actualizar');

      setUsuarios(usuarios.map(u => 
        u.id === rolId ? {
          ...u,
          permisos: {
            ...u.permisos,
            [objetoId]: {
              ...u.permisos[objetoId],
              [permisoId]: nuevoEstado
            }
          }
        } : u
      ));

      MySwal.fire({
        icon: 'success',
        title: '¡Actualizado!',
        text: 'Permiso modificado correctamente',
        timer: 1500
      });
    } catch (error) {
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
      });
    }
  };

  useEffect(() => { cargarPermisos(); }, []);

  // ==================== RENDERIZADO ====================
  if (cargando) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
    </div>
  );

  if (!canSelect) return <AccessDenied />;

  return (
    <div className="container-fluid py-3">
      {/* Advertencia */}
      {mostrarAdvertencia && (
        <div className="alert alert-warning alert-dismissible fade show mb-4">
          <strong>¡ADVERTENCIA!:</strong> MODIFICAR ALGO EN ESTA PÁGINA AFECTARÁ LOS PERMISOS DE OTROS USUARIOS.
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setMostrarAdvertencia(false)}
          />
        </div>
      )}

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <div className="mb-3 mb-md-0">
          <h1 className="h2 mb-1">{pathName}</h1>
          <p className="text-muted mb-0">Gestión de permisos por módulo y rol</p>
        </div>
        <CButton color="success" onClick={cargarPermisos}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Actualizar
        </CButton>
      </div>

      {/* Layout principal */}
      <div className="row g-4">
        {/* Panel de roles (25% ancho) */}
        <div className="col-md-3">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="card-title mb-3">Roles</h5>
              <CInputGroup className="mb-3">
                <CFormInput
                  placeholder="Buscar rol..."
                  value={busquedaRol}
                  onChange={(e) => setBusquedaRol(e.target.value)}
                />
              </CInputGroup>
              <div className="list-group">
                {usuarios
                  .filter(u => u.nombre.toLowerCase().includes(busquedaRol.toLowerCase()))
                  .map(usuario => (
                    <button
                      key={usuario.id}
                      className={`list-group-item list-group-item-action text-start ${usuario.id === rolSeleccionado ? 'active' : ''}`}
                      onClick={() => setRolSeleccionado(usuario.id)}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <span>{usuario.nombre}</span>
                        {usuario.id === rolSeleccionado && (
                          <span className="badge bg-primary rounded-pill">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal (75% ancho) */}
        <div className="col-md-9">
          <div className="card h-100">
            <div className="card-body">
              {/* Pestañas */}
              <CNav variant="tabs" className="mb-4">
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
                    active={vistaActual === 'personas'} 
                    onClick={() => setVistaActual('personas')}
                  >
                    Personas
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
                    active={vistaActual === 'usuarios'} 
                    onClick={() => setVistaActual('usuarios')}
                  >
                    Usuarios
                  </CNavLink>
                </CNavItem>
              </CNav>

              {/* Búsqueda */}
              <CInputGroup className="mb-4">
                <CFormInput
                  placeholder={`Buscar módulo en ${vistaActual}...`}
                  value={busquedaObjeto}
                  onChange={(e) => setBusquedaObjeto(e.target.value)}
                />
                <CButton color="secondary" variant="outline">
                  <i className="bi bi-search"></i>
                </CButton>
              </CInputGroup>

              {/* Listado de módulos */}
              <div className="accordion" id="modulesAccordion">
                {categorias[vistaActual]
                  .filter(modulo => 
                    modulo.name.toLowerCase().includes(busquedaObjeto.toLowerCase()) ||
                    modulo.description.toLowerCase().includes(busquedaObjeto.toLowerCase())
                  )
                  .map((modulo, index) => (
                    <CCard key={modulo.id} className="mb-3">
                      <CCardHeader 
                        className="cursor-pointer d-flex justify-content-between align-items-center"
                        onClick={() => setVisibleSections(prev => ({
                          ...prev,
                          [modulo.id]: !prev[modulo.id]
                        }))}
                      >
                        <CCardTitle className="mb-0">{modulo.name}</CCardTitle>
                        <i className={`bi bi-chevron-${visibleSections[modulo.id] ? 'up' : 'down'}`}></i>
                      </CCardHeader>
                      <CCollapse visible={visibleSections[modulo.id]}>
                        <CCardBody>
                          <p className="text-muted mb-4">{modulo.description}</p>
                          <div className="row g-3">
                            {permisos.map(permiso => (
                              <div key={permiso.id} className="col-md-6">
                                <div className="d-flex justify-content-between align-items-center p-2 border rounded">
                                  <label className="form-check-label" htmlFor={`permiso-${modulo.id}-${permiso.id}`}>
                                    {permiso.name}
                                  </label>
                                  <div className="form-check form-switch">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id={`permiso-${modulo.id}-${permiso.id}`}
                                      checked={usuarios.find(u => u.id === rolSeleccionado)?.permisos[modulo.id]?.[permiso.id] || false}
                                      onChange={() => cambiarPermiso(rolSeleccionado, modulo.id, permiso.id)}
                                      style={{ width: '3em', height: '1.5em' }}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CCardBody>
                      </CCollapse>
                    </CCard>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestorDePermisos;