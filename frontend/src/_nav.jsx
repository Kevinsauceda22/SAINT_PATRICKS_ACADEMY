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
} from '@coreui/icons';
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react';

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: cilSpeedometer, // Solo se guarda el icono
  },
  {
    component: CNavItem,
    name: 'Asistencia',
    to: '/pages/calificaciones/ListaAsistencia',
    icon: cilClipboard,
  },
  {
    component: CNavItem,
    name: 'Profesores',
    to: '/pages/calificaciones/ListaProfesores',
    icon: cilPeople,
  },
  {
    component: CNavItem,
    name: 'Actividades académicas',
    to: '/pages/calificaciones/ListaActividadesAca',
    icon: cilTask,
  },
  {
    component: CNavItem,
    name: 'Notas',
    to: '',
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
        to: '/pages/calificaciones/ListaAsignaturas',
      },
      {
        component: CNavItem,
        name: 'Ciclos',
        to: '/pages/calificaciones/ListaCiclos',
      },
      {
        component: CNavItem,
        name: 'Especialidades',
        to: '/pages/calificaciones/ListaEspecialidades',
      },
      {
        component: CNavItem,
        name: 'Estado asistencia',
        to: '/pages/calificaciones/ListaEstadoasistencia',
      },
      {
        component: CNavItem,
        name: 'Estado nota',
        to: '/pages/calificaciones/ListaEstadonota',
      },
      {
        component: CNavItem,
        name: 'Grados',
        to: '/pages/calificaciones/ListaGrados',
      },
      {
        component: CNavItem,
        name: 'Grado académico',
        to: '/pages/calificaciones/ListaGradoAcademico',
      },
      {
        component: CNavItem,
        name: 'Parciales',
        to: '/pages/calificaciones/ListaParciales',
      },
      {
        component: CNavItem,
        name: 'Ponderaciones',
        to: '/pages/calificaciones/ListaPonderaciones',
      },
      {
        component: CNavItem,
        name: 'Tipo de contrato',
        to: '/pages/calificaciones/ListaTipoContrato',
      },
      
    ],
  },
];

export default _nav;
