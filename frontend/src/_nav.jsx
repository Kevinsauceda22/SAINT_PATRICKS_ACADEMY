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
  cilChartLine,
  cilFile,
  cilBookmark,
  cilDollar,
  cilGraph,
  cilUser,
} from '@coreui/icons';
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react';

const _nav = [
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
  {
    component: CNavItem,
    name: 'Matrícula',
    to: '/matricula', // La ruta que deseas para la matrícula
    nameobject: 'Matricula',

    icon: cilSchool,
  },
   {
    component: CNavItem,
    name: 'Grados Asignaturas',
    to: '/ListaGradosAsignaturas',
    icon: cilClipboard,
    nameobject: 'navGradosAsignaturas',
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
    nameobject: 'navAsistenciaProfesor',
  },
  {
    component: CNavItem,
    name: 'Profesores',
    to: '/ListaProfesores',
    icon: cilPeople,
    nameobject: 'ListaProfesores',
  },
  {
    component: CNavItem,
    name: 'Actividades académicas',
    to: '/ListaActividadesAca',
    icon: cilTask,
    nameobject: 'navActividadesAcademicas',
  },
  
  {
    component: CNavItem,
    name: 'Actividades extracurriculares',
    to: '/actividades',
    icon: cilSchool,
    nameobject: 'actividades',
  },
  {
    component: CNavItem,
    name: 'Mis Notas',
    to: '/ListaNotasProfesor',
    icon: cilFile,
    nameobject: 'navNotasProfesor',
  },
  {
    component: CNavItem,
    name: 'Notas',
    to: '/ListaNotas',
    icon: cilFile,
    nameobject: 'ListaEstadonota',
  },


    {
     component: CNavItem,
     name: 'Secciones asignaturas',
     to: '/ListaSecciones_Asignatura',
     icon: cilFile,
    nameobject: 'navListaSecciones_Asignaturas',
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
      name: 'Solicitudes Admin',
      to: '/Solicitud_admin',
      icon: cilCalendar, 
      nameobject: 'Solicitud_admin',

      
    },
  {
    component: CNavGroup,
    name: 'Mantenimientos',
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
        to: '/pages/matricula/ListaAulas',
        nameobject: 'ListaAulas',
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
  {
    component: CNavGroup,
    name: 'Contabilidad y Pagos',
    icon: cilDollar,
    nameobject: 'navContabilidadYPagos',
    items: [
      {
        component: CNavItem,
        name: 'Pagos Matricula',
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
  {
    component: CNavGroup,
    name: 'Personas',
    icon: cilUser,
    items: [
      {
        component: CNavItem,
        name: 'Personas',
        to: '/ListaPersonas',
        nameobject: 'ListaPersonas',
      },
      {
        component: CNavItem,
        name: 'Familias',
        to: '/ListaEstructura',
        nameobject: 'ListaEstructura',
      },
      {
        component: CNavItem,
        name: 'Estructuras',
        to: '/ListaEstructura',
        nameobject: 'ListaRelacion',
      },
      {
        component: CNavItem,
        name: 'Tipo de Relaciones',
        to: 'ListaRelacion',
        nameobject: 'Lista Relacion',
      },
      {
        component: CNavItem,
        name: 'Tipo persona',
        to: '/tipopersona',
        nameobject: 'tipopersona',
      },{
        component: CNavItem,
        name: 'Historial Procedencia',
        to: '/ListaHistoricoProc',
        nameobject: 'ListaHistoricoProc',
      },
      {
        component: CNavItem,
        name: 'Departamento',
        to: '/departamento',
        nameobject: 'departamento',
      },

      {
        component: CNavItem,
        name: 'Municipios',
        to: '/municipios',
        nameobject: 'Municipios',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Reportes de Bitácora',
    icon: cilGraph,
    nameobject: 'navReportesBitacora',
    items: [
      {
        component: CNavItem,
        name: 'Actividades del Sistema',
        to: '/ReporteActividades',
        nameobject: 'navActividadesSistema',
      },
      {
        component: CNavItem,
        name: 'Historial de Inicios de Sesión',
        to: '/ReporteIniciosSesion',
        nameobject: 'navIniciosSesion',
      },
      {
        component: CNavItem,
        name: 'Cambios en Datos',
        to: '/ReporteCambiosDatos',
        nameobject: 'navCambiosDatos',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Administrador de Usuarios',
    icon: cilUser,
    nameobject: 'GestionUsuarios',
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
    ],
  },
];

export default _nav;
