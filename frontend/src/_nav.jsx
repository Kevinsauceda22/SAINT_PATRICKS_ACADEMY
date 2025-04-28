import {
  cilSpeedometer,
  cilPeople,
  cilTask,
  cilClipboard,
  cilListRich,
  cilSchool,
  cilCalendar,
  cilCalculator,
  cilSpreadsheet,
  cilLibrary,
  cilDollar,
  cilGraph,
  cilUser,
  cilFolderOpen,
} from '@coreui/icons';
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react';
const hasPermission = (nameobject, permisos) => permisos?.includes(nameobject);



const _nav = [
  // Inicio
  {
    component: CNavTitle,
    name: 'Inicio',
  },
  {
    component: CNavItem,
    name: 'Panel de control',
    to: '/PaginaPrincipal',
    icon: cilSpeedometer,
    nameobject: 'PaginaPrincipal',
  },
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: cilSpeedometer,
    nameobject: 'Dashboard',
  },

  // Gestión Académica
  {
    component: CNavTitle,
    name: 'Gestión Académica',
  },
  {
    component: CNavItem,
    name: 'Agrupador de Secciones',
    to: '/gestion_academica',
    icon: cilFolderOpen,
    nameobject: 'Solicitud_admin',
  },
  {
    component: CNavItem,
    name: 'Matrícula',
    to: '/matricula',
    icon: cilSchool,
    nameobject: 'Matricula',
  },
  {
    component: CNavItem,
    name: 'Grados y Asignaturas',
    to: '/ListaGradosAsignaturas',
    icon: cilClipboard,
    nameobject: 'ListaGradosAsignaturas',
  },
  {
    component: CNavItem,
    name: 'Ponderaciones por Ciclo',
    to: '/ListaPonderacionesCiclos',
    icon: cilCalculator,
    nameobject: 'ListaPonderacionesCiclos',
  },
  {
    component: CNavItem,
    name: 'Profesores',
    to: '/ListaProfesores',
    icon: cilPeople,
    nameobject: 'ListaProfesores',
  },

  // Asistencia y Actividades
  {
    component: CNavTitle,
    name: 'Asistencia y Actividades',
  },
  {
    component: CNavItem,
    name: 'Asistencias',
    to: '/ListaAsistencia',
    icon: cilClipboard,
    nameobject: 'ListaAsistencia',
  },
  {
    component: CNavItem,
    name: 'Mis Asistencias',
    to: '/ListaAsistenciaProfesor',
    icon: cilClipboard,
    nameobject: 'ListaAsistenciaProfesor',
  },
  {
    component: CNavItem,
    name: 'Actividades Académicas',
    to: '/ListaActividadesAca',
    icon: cilTask,
    nameobject: 'ListaActividadesAca',
  },
  {
    component: CNavItem,
    name: 'Mis Actividades (Profesor)',
    to: '/VistaListaProfesor',
    icon: cilTask,
    nameobject: 'ListaActividadesProfesor',
  },
  {
    component: CNavItem,
    name: 'Mis Actividades (Padre)',
    to: '/ListaActividadesAcaVistaPadre',
    icon: cilTask,
    nameobject: 'ListaActividadesAcaVistaPadre',
  },
  {
    component: CNavItem,
    name: 'Extracurriculares',
    to: '/actividades',
    icon: cilSchool,
    nameobject: 'actividades',
  },

  // Notas y Evaluaciones
  {
    component: CNavTitle,
    name: 'Notas y Evaluaciones',
  },
  {
    component: CNavItem,
    name: 'Mis Notas',
    to: '/ListaNotasProfesor',
    icon: cilSpreadsheet,
    nameobject: 'ListaNotasProfesor',
  },
  {
    component: CNavItem,
    name: 'Notas Generales',
    to: '/ListaNotas',
    icon: cilSpreadsheet,
    nameobject: 'ListaNotas',
  },
  {
    component: CNavItem,
    name: 'Cuadro de Notas (Profesor)',
    to: '/ListaCuadroProfesor',
    icon: cilLibrary,
    nameobject: 'ListaCuadroProfesor',
  },
  {
    component: CNavItem,
    name: 'Cuadro de Notas (Padre)',
    to: '/ListaCuadroPadre',
    icon: cilLibrary,
    nameobject: 'ListaCuadroPadre',
  },
  {
    component: CNavItem,
    name: 'Cuadro de Notas (General)',
    to: '/ListaCuadro',
    icon: cilLibrary,
    nameobject: 'ListaCuadro',
  },

  // Solicitudes
  {
    component: CNavTitle,
    name: 'Solicitudes',
  },
  {
    component: CNavItem,
    name: 'Solicitudes Padres',
    to: '/Solicitud',
    icon: cilCalendar,
    nameobject: 'Solicitudes_Padre',
  },
  {
    component: CNavItem,
    name: 'Solicitudes Administrativas',
    to: '/Solicitud_admin',
    icon: cilCalendar,
    nameobject: 'Solicitud_admin',
  },

  {
    component: CNavItem,
    name: 'Caja',
    to: '/caja',
    icon: cilDollar,
    nameobject: 'Caja',
  },
  {
    component: CNavGroup,
    name: 'Contabilidad y Pagos',
    icon: cilDollar,
    nameobject: 'navContabilidadYPagos',
    items: [
      {
        component: CNavItem,
        name: 'Pagos Matrícula',
        to: '/ListaPagosMatricula',
        nameobject: 'navPagosMatricula',
      },
      {
        component: CNavItem,
        name: 'Historial de Pagos Mensuales',
        to: '/HistorialPagosMensuales',
        nameobject: 'navHistorialPagosMensuales',
      },
      {
        component: CNavItem,
        name: 'Libro Diario',
        to: '/LibroDiario',
        nameobject: 'LibroDiario',
      },
    ],
  },

  // Personas
  {
    component: CNavTitle,
    name: 'Personas',
  },
  {
    component: CNavGroup,
    name: 'Gestión de Personas',
    icon: cilUser,
    nameobject: 'ListaPersonas',
    items: [
      { component: CNavItem, name: 'Personas', to: '/ListaPersonas', nameobject: 'ListaPersonas' },
      { component: CNavItem, name: 'Caja', to: '/caja', nameobject: 'caja' },
      { component: CNavItem, name: 'Tipo de Relaciones', to: 'ListaRelacion', nameobject: 'ListaRelacion' },
      { component: CNavItem, name: 'Tipo de Persona', to: '/ListaTipoPersona', nameobject: 'ListaTipoPersona' },
      { component: CNavItem, name: 'Tipo de Documentos', to: '/ListaTipoDocumentos', nameobject: 'ListaTipoDocumentos' },
      { component: CNavItem, name: 'Departamentos', to: '/ListaDepartamentos', nameobject: 'ListaDepartamentos' },
      { component: CNavItem, name: 'Municipios', to: '/ListaMunicipios', nameobject: 'ListaMunicipios' },
      { component: CNavItem, name: 'Países', to: '/nacionalidad', nameobject: 'nacionalidad' },
      { component: CNavItem, name: 'Tipo Contacto', to: '/tipoContacto' },
      { component: CNavItem, name: 'Género Persona', to: '/generoPersona' },
    ],
  },

  // Mantenimientos
  {
    component: CNavTitle,
    name: 'Mantenimientos',
  },
  {
    component: CNavGroup,
    name: 'Mantenimientos',
    icon: cilListRich,
    nameobject: 'ListaAsignaturas',
    items: [
      { component: CNavItem, name: 'Parámetros', to: '/ListaParametro' },
      { component: CNavItem, name: 'Asignaturas', to: '/ListaAsignaturas', nameobject: 'ListaAsignaturas' },
      { component: CNavItem, name: 'Ciclos', to: '/ListaCiclos', nameobject: 'ListaCiclos' },
      { component: CNavItem, name: 'Especialidades', to: '/ListaEspecialidades', nameobject: 'ListaEspecialidades' },
      { component: CNavItem, name: 'Estados Asistencia', to: '/ListaEstadoasistencia', nameobject: 'ListaEstadoasistencia' },
      { component: CNavItem, name: 'Estados Nota', to: '/ListaEstadonota', nameobject: 'ListaEstadonota' },
      { component: CNavItem, name: 'Grados', to: '/ListaGrados', nameobject: 'ListaGrados' },
      { component: CNavItem, name: 'Grados Académicos', to: '/ListaGradoAcademico', nameobject: 'ListaGradoAcademico' },
      { component: CNavItem, name: 'Parciales', to: '/ListaParciales', nameobject: 'ListaParciales' },
      { component: CNavItem, name: 'Ponderaciones', to: '/ListaPonderaciones', nameobject: 'ListaPonderaciones' },
      { component: CNavItem, name: 'Tipos de Contratos', to: '/ListaTipoContrato', nameobject: 'ListaTipoContrato' },
      { component: CNavItem, name: 'Historiales Académicos', to: '/ListaHistoriales', nameobject: 'ListaHistorial' },
      { component: CNavItem, name: 'Institutos', to: '/ListaInstitutos', nameobject: 'ListaInstitutos' },
      { component: CNavItem, name: 'Tipo Matrícula', to: '/tipomatricula', nameobject: 'tipomatricula' },
      { component: CNavItem, name: 'Periodo Matrícula', to: '/periodomatricula', nameobject: 'periodomatricula' },
      { component: CNavItem, name: 'Estado Matrícula', to: '/estadomatricula', nameobject: 'estadomatricula' },
      { component: CNavItem, name: 'Concepto Pago', to: '/conceptopago', nameobject: 'conceptopago' },
      { component: CNavItem, name: 'Edificios', to: '/edificios', nameobject: 'edificios' },
      { component: CNavItem, name: 'Aulas', to: '/aulas', nameobject: 'aulas' },
      { component: CNavItem, name: 'Cuentas Contables', to: '/Contabilidad', nameobject: 'Contabilidad' },
    ],
  },

  // Auditoría
  {
    component: CNavTitle,
    name: 'Auditoría',
  },
  {
    component: CNavGroup,
    name: 'Reportes de Bitácora',
    icon: cilGraph,
    nameobject: 'Auditoria',
    items: [
      {
        component: CNavItem,
        name: 'Actividades del Sistema',
        to: '/Auditoria',
        nameobject: 'Auditoria',
      },
    ],
  },

  // Administración de Usuarios
  {
    component: CNavTitle,
    name: 'Administración de Usuarios',
  },
  {
    component: CNavGroup,
    name: 'Gestión de Usuarios y Roles',
    icon: cilUser,
    nameobject: 'GestionUsuarios',
    items: [
      { component: CNavItem, name: 'Usuarios', to: '/UserMagnament', nameobject: 'navUsuarios' },
      { component: CNavItem, name: 'Permisos', to: '/rolesandpermissions', nameobject: 'rolesandpermissions' },
    ],
  },
];

export default _nav;
