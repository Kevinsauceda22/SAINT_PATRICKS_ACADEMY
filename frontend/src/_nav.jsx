import React from 'react'
import CIcon from '@coreui/icons-react'
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
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />, // Icono de velocidad para el panel de control
  },
  {
    component: CNavTitle,
    name: 'Components',
  },
  {
    component: CNavGroup,
    name: 'Asistencia',
    icon: <CIcon icon={cilClipboard} customClassName="nav-icon" />, // Icono de clipboard para asistencia
    items: [
      {
        component: CNavItem,
        name: 'Asistencia',
        to: '/pages/calificaciones/ListaAsistencia',
      },
      {
        component: CNavItem,
        name: 'Estado asistencia',
        to: '/pages/calificaciones/ListaEstadoasistencia',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Profesores',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />, // Icono de personas para profesores
    items: [
      {
        component: CNavItem,
        name: 'Profesores',
        to: '/pages/calificaciones/ListaProfesores',
      },
      {
        component: CNavItem,
        name: 'Tipo de contrato',
        to: '/pages/calificaciones/ListaTipoContrato',
      },
      {
        component: CNavItem,
        name: 'Grado académico',
        to: '/pages/calificaciones/ListaGradoAcademico',
      },
      {
        component: CNavItem,
        name: 'Especialidades',
        to: '/pages/calificaciones/ListaEspecialidades',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Ciclos',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />, // Icono de calendario para ciclos
    items: [
      {
        component: CNavItem,
        name: 'Ciclos',
        to: '/pages/calificaciones/ListaCiclos',
      },
      {
        component: CNavItem,
        name: 'Ponderaciones',
        to: '/pages/calificaciones/ListaPonderaciones',
      },
      {
        component: CNavItem,
        name: 'Grados',
        to: '/pages/calificaciones/ListaGrados',
      },
      {
        component: CNavItem,
        name: 'Asignaturas',
        to: '/pages/calificaciones/ListaAsignaturas',
      },
      {
        component: CNavItem,
        name: 'Parciales',
        to: '/pages/calificaciones/ListaParciales',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Actividades académicas',
    icon: <CIcon icon={cilTask} customClassName="nav-icon" />, // Icono de tareas para actividades
    items: [
      {
        component: CNavItem,
        name: 'Actividades',
        to: '/pages/calificaciones/ListaActividadesAca',
      },
      {
        component: CNavItem,
        name: 'Nota',
        to: '/buttons/button-groups',
      },
      {
        component: CNavItem,
        name: 'Estado nota',
        to: '/pages/calificaciones/ListaEstadonota',
      },
    ],
  },
]


export default _nav
