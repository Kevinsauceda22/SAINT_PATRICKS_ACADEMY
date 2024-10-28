import React from 'react';
import CIcon from '@coreui/icons-react';
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
    name: 'Dashboard',
    to: '/dashboard',
    icon: cilSpeedometer,
  },
  {
    component: CNavItem,
    name: 'Asistencia',
    to: '/ListaAsistencia',
    icon: cilClipboard,
  },
  {
    component: CNavItem,
    name: 'Profesores',
    to: '/ListaProfesores',
    icon: cilPeople,
  },
  {
    component: CNavItem,
    name: 'Actividades académicas',
    to: '/ListaActividadesAca',
    icon: cilTask,
  },
  {
    component: CNavItem,
    name: 'Notas',
    to: '/notas',
    icon: cilFile,
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
      },
      {
        component: CNavItem,
        name: 'Ciclos',
        to: '/ListaCiclos',
      },
      {
        component: CNavItem,
        name: 'Especialidades',
        to: '/ListaEspecialidades',
      },
      {
        component: CNavItem,
        name: 'Estado asistencia',
        to: '/ListaEstadoasistencia',
      },
      {
        component: CNavItem,
        name: 'Estado nota',
        to: '/ListaEstadonota',
      },
      {
        component: CNavItem,
        name: 'Grados',
        to: '/ListaGrados',
      },
      {
        component: CNavItem,
        name: 'Grado académico',
        to: '/ListaGradoAcademico',
      },
      {
        component: CNavItem,
        name: 'Parciales',
        to: '/ListaParciales',
      },
      {
        component: CNavItem,
        name: 'Ponderaciones',
        to: '/ListaPonderaciones',
      },
      {
        component: CNavItem,
        name: 'Tipo de contrato',
        to: '/ListaTipoContrato',
      },
      {
        component: CNavItem,
        name: 'Permisos',
        to: '/ListaPermisos',
      },
      {
        component: CNavItem,
        name: 'Tipo matricula',
        to: '/tipomatricula',
      },{
        component: CNavItem,
        name: 'Periodo matricula',
        to: '/periodomatricula',
      },{
        component: CNavItem,
        name: 'Estado matricula',
        to: '/estadomatricula',
      },{
        component: CNavItem,
        name: 'Concepto pago',
        to: '/conceptopago',
      },{
        component: CNavItem,
        name: 'Departamento',
        to: '/departamento',
      },{
        component: CNavItem,
        name: 'Tipo persona',
        to: '/tipopersona',
      },{
        component: CNavItem,
        name: 'Edificios',
        to: 'ListaEdificios',
      },{
        component: CNavItem,
        name: 'Dias',
        to: 'ListaDias',
      },{
        component: CNavItem,
        name: 'Lista de Actividades',
        to: 'ListaActivex', 
      },{
        component: CNavItem,
        name: 'Historial Procedencia',
        to: 'ListaHistoricoProc',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Contabilidad y Pagos',
    icon: cilDollar,
    items: [
      {
        component: CNavItem,
        name: 'Pagos',
        to: '/ListaPagos',
      },
      {
        component: CNavItem,
        name: 'Historial de Pagos',
        to: '/HistorialPagos',
      },
      {
        component: CNavItem,
        name: 'Estado de Cuenta',
        to: '/EstadoCuenta',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Reportes de Bitácora',
    icon: cilGraph,
    items: [
      {
        component: CNavItem,
        name: 'Actividades del Sistema',
        to: '/ReporteActividades',
      },
      {
        component: CNavItem,
        name: 'Historial de Inicios de Sesión',
        to: '/ReporteIniciosSesion',
      },
      {
        component: CNavItem,
        name: 'Cambios en Datos',
        to: '/ReporteCambiosDatos',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Administrador de Usuarios',
    icon: cilUser,
    items: [
      {
        component: CNavItem,
        name: 'Usuarios',
        to: '/ListaUsuarios',
      },
      {
        component: CNavItem,
        name: 'Roles',
        to: '/ListaRoles',
      },
  
    ],
  },
];

export default _nav;
