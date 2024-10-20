import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

const Ciclos = React.lazy(() => import('./views/pages/calificaciones/ListaCiclos'))
const Ponderaciones = React.lazy(() => import('./views/pages/calificaciones/ListaPonderaciones'))
const Grados = React.lazy(() => import('./views/pages/calificaciones/ListaGrados'))
const Asignaturas = React.lazy(() => import('./views/pages/calificaciones/ListaAsignaturas'))
const Parciales = React.lazy(() => import('./views/pages/calificaciones/ListaParciales'))

const Estadonota = React.lazy(() => import('./views/pages/calificaciones/ListaEstadonota'))

const Estadoasistencia = React.lazy(() => import('./views/pages/calificaciones/ListaEstadoasistencia'))
const Asistencia = React.lazy(() => import('./views/pages/calificaciones/ListaAsistencia'))

const Profesores = React.lazy(() => import('./views/pages/calificaciones/ListaProfesores'))
const TipoContrato = React.lazy(() => import('./views/pages/calificaciones/ListaTipoContrato')) 
const ListaActividadesAca = React.lazy(() => import('./views/pages/calificaciones/ListaActividadesAca'))
const ListaEspecialidades = React.lazy(() => import('./views/pages/calificaciones/ListaEspecialidades'))
const ListaGradoAcademico = React.lazy(() => import('./views/pages/calificaciones/ListaGradoAcademico'))






const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard }, 
  { path: '/pages/calificaciones/ListaCiclos', name: 'Ciclos', element: Ciclos },
  { path: '/pages/calificaciones/ListaPonderaciones', name: 'Ponderaciones', element: Ponderaciones },
  { path: '/pages/calificaciones/ListaGrados', name: 'Grados', element: Grados },
  { path: '/pages/calificaciones/ListaAsignaturas', name: 'Asignaturas', element: Asignaturas },
  { path: '/pages/calificaciones/ListaParciales', name: 'Parciales', element: Parciales },

  { path: '/pages/calificaciones/ListaEstadonota', name: 'Estadonota', element: Estadonota },
  
  { path: '/pages/calificaciones/ListaEstadoasistencia', name: 'Estadoasistencia', element: Estadoasistencia },
  { path: '/pages/calificaciones/ListaAsistencia', name: 'Asistencia', element: Asistencia },

  { path: '/pages/calificaciones/ListaProfesores', name: 'Profesores', element: Profesores },
  { path: '/pages/calificaciones/ListaTipoContrato', name: 'Tipo de Contrato', element: TipoContrato },
  { path: '/pages/calificaciones/ListaActividadesAca', name: 'Tipo de actividades academicas', element: ListaActividadesAca },
  { path: '/pages/calificaciones/ListaEspecialidades', name: 'Tipo de especialidades', element: ListaEspecialidades },
  { path: '/pages/calificaciones/ListaGradoAcademico', name: 'Tipo de grado academico', element: ListaGradoAcademico },

]

export default routes
