import {
  cilSpeedometer,
  cilPeople,
  cilTask,
  cilClipboard,
  cilListRich,
  cilSchool,
  cilBook,
  cilCalendar,
  cilPencil,
  cilCalculator,
  cilChartLine,
  cilFile,
  cilBookmark,
  cilDollar,
  cilGraph,
  cilUser,
  cilFolderOpen,
} from '@coreui/icons';
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react';

const _nav = [
  // Dashboard y Control
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
    component: CNavGroup,
    name: 'Gestión Académica',
    icon: cilSchool,
    items: [
      {
        component: CNavItem,
        name: 'Gestión General',
        to: '/gestion_academica',
        nameobject: 'Solicitud_admin',
      },
      {
        component: CNavItem,
        name: 'Matrícula',
        to: '/matricula',
        nameobject: 'Matricula',
      },
      {
        component: CNavItem,
        name: 'Grados Asignaturas',
        to: '/ListaGradosAsignaturas',
        nameobject: 'ListaGradosAsignaturas',
      },
    ],
  },

  // Evaluaciones
  {
    component: CNavGroup,
    name: 'Evaluaciones',
    icon: cilFile,
    items: [
      {
        component: CNavItem,
        name: 'Notas',
        to: '/ListaNotas',
        nameobject: 'ListaNotas',
      },
      {
        component: CNavItem,
        name: 'Mis Notas',
        to: '/ListaNotasProfesor',
        nameobject: 'ListaNotasProfesor',
      },
      {
        component: CNavItem,
        name: 'Ponderaciones Ciclos',
        to: '/ListaPonderacionesCiclos',
        nameobject: 'ListaPonderacionesCiclos',
      },
    ],
  },

  // Control de Asistencia
  {
    component: CNavGroup,
    name: 'Asistencias',
    icon: cilClipboard,
    items: [
      {
        component: CNavItem,
        name: 'Control de Asistencias',
        to: '/ListaAsistencia',
        nameobject: 'ListaAsistencia',
      },
      {
        component: CNavItem,
        name: 'Mis Asistencias',
        to: '/ListaAsistenciaProfesor',
        nameobject: 'ListaAsistenciaProfesor',
      },
    ],
  },

  // Actividades
  {
    component: CNavGroup,
    name: 'Actividades',
    icon: cilTask,
    items: [
      {
        component: CNavItem,
        name: 'Actividades Académicas',
        to: '/ListaActividadesAca',
        nameobject: 'ListaActividadesAca',
      },
      {
        component: CNavItem,
        name: 'Mis Actividades',
        to: '/VistaListaProfesor',
        nameobject: 'ListaActividadesProfesor',
      },
      {
        component: CNavItem,
        name: 'Extracurriculares',
        to: '/actividades',
        nameobject: 'actividades',
      },
    ],
  },

  // Gestión Financiera
  {
    component: CNavGroup,
    name: 'Gestión Financiera',
    icon: cilDollar,
    items: [
      {
        component: CNavItem,
        name: 'Caja',
        to: '/caja',
        nameobject: 'Solicitud_admin',
      },
      {
        component: CNavItem,
        name: 'Pagos Matrícula',
        to: '/ListaPagosMatricula',
        nameobject: 'navPagosMatricula',
      },
      {
        component: CNavItem,
        name: 'Historial Pagos Mensuales',
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

  // Gestión de Personal
  {
    component: CNavGroup,
    name: 'Personal',
    icon: cilPeople,
    items: [
      {
        component: CNavItem,
        name: 'Profesores',
        to: '/ListaProfesores',
        nameobject: 'ListaProfesores',
      },
      {
        component: CNavGroup,
        name: 'Registro de Personas',
        items: [
          {
            component: CNavItem,
            name: 'Personas',
            to: '/ListaPersonas',
            nameobject: 'ListaPersonas',
          },
          {
            component: CNavItem,
            name: 'Tipo de Relaciones',
            to: '/ListaRelacion',
            nameobject: 'ListaRelacion',
          },
        ],
      },
    ],
  },

  // Mantenimientos del Sistema
  {
    component: CNavGroup,
    name: 'Configuración',
    icon: cilListRich,
    items: [
      {
        component: CNavItem,
        name: 'Asignaturas',
        to: '/ListaAsignaturas',
        nameobject: 'ListaAsignaturas',
      },
      {
        component: CNavItem,
        name: 'Ciclos',
        to: '/ListaCiclos',
        nameobject: 'ListaCiclos',
      },
      {
        component: CNavItem,
        name: 'Especialidades',
        to: '/ListaEspecialidades',
        nameobject: 'ListaEspecialidades',
      },
      {
        component: CNavItem,
        name: 'Estado asistencia',
        to: '/ListaEstadoasistencia',
        nameobject: 'ListaEstadoasistencia',
      },
      {
        component: CNavItem,
        name: 'Estado nota',
        to: '/ListaEstadonota',
        nameobject: 'ListaEstadonota',
      },
      {
        component: CNavItem,
        name: 'Grados',
        to: '/ListaGrados',
        nameobject: 'ListaGrados',
      },
      {
        component: CNavItem,
        name: 'Grado académico',
        to: '/ListaGradoAcademico',
        nameobject: 'ListaGradoAcademico',
      },
      {
        component: CNavItem,
        name: 'Parciales',
        to: '/ListaParciales',
        nameobject: 'ListaParciales',
      },
      {
        component: CNavItem,
        name: 'Ponderaciones',
        to: '/ListaPonderaciones',
        nameobject: 'ListaPonderaciones',
      },
      {
        component: CNavItem,
        name: 'Tipo de contrato',
        to: '/ListaTipoContrato',
        nameobject: 'ListaTipoContrato',
      },
      {
        component: CNavItem,
        name: 'Historial Academico',
        to: '/ListaHistoriales',
        nameobject: 'ListaHistorial',
      },
      {
        component: CNavItem,
        name: 'Tipo matricula',
        to: '/tipomatricula',
        nameobject: 'tipomatricula',
      },
      {
        component: CNavItem,
        name: 'Periodo matricula',
        to: '/periodomatricula',
        nameobject: 'periodomatricula',
      },
      {
        component: CNavItem,
        name: 'Estado matricula',
        to: '/estadomatricula',
        nameobject: 'estadomatricula',
      },
      {
        component: CNavItem,
        name: 'Concepto pago',
        to: '/conceptopago',
        nameobject: 'conceptopago',
      },
      {
        component: CNavItem,
        name: 'Edificios',
        to: '/edificios',
        nameobject: 'edificios',
      },
      {
        component: CNavItem,
        name: 'Aulas',
        to: '/aulas',
        nameobject: 'aulas',
      },
      {
        component: CNavItem,
        name: 'Dias',
        to: '/dias',
        nameobject: 'dias',
      },
      {
        component: CNavItem,
        name: 'Cuentas Contables',
        to: '/Contabilidad',
        nameobject: 'Contabilidad',
      },
    ],
  },

  // Administración
  {
    component: CNavGroup,
    name: 'Administración',
    icon: cilUser,
    items: [
      {
        component: CNavItem,
        name: 'Usuarios',
        to: '/UserMagnament',
        nameobject: 'navUsuarios',
      },
      {
        component: CNavItem,
        name: 'Permisos',
        to: '/rolesandpermissions',
        nameobject: 'rolesandpermissions',
      },
      {
        component: CNavItem,
        name: 'Bitácora',
        to: '/Auditoria',
        nameobject: 'Auditoria',
      },
    ],
  },
];

export default _nav;
