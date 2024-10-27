import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CSpinner, useColorModes } from '@coreui/react';
import './scss/style.scss';
import { AuthProvider } from "../context/AuthProvider";
import RutaProtegida from './layout/RutaProtegida'; // Importa el componente RutaProtegida
import RutaPublica from './layout/RutaPublica'; // Componente de rutas públicas


// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'));
const PreRegistro = React.lazy(() => import('./views/pages/Pre-Registro/Pre-Registro'));
const Register = React.lazy(() => import('./views/pages/register/Register'));
const ResetPasssword = React.lazy(() => import('./views/pages/ResetPassword/ResetPassword'));
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'));
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'));
const Matricula = React.lazy(() => import('./views/pages/matricula/matricula'));
const ConfirmacionEmail = React.lazy(() => import('./views/pages/email-confirmation/email-confirmation'));
const CorreoVerificado = React.lazy(() => import('./views/pages/email-check/email-check'));
const VerificarEmail = React.lazy(() => import('./views/pages/components/verificar cuenta/verificarCuenta'));
const NuevaContrasena = React.lazy(() => import("./views/pages/NewPassword/NewPass"));
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'));
const Perfil = React.lazy(() => import('./views/pages/profile/profile'));
const TwoAuthFA = React.lazy(() => import('./views/pages/2FA/2fa'));
const ListaActiviadesAca = React.lazy(() => import('./views/pages/calificaciones/ListaActividadesAca'));
const ListaAsigaturas = React.lazy(() => import('./views/pages/calificaciones/ListaAsignaturas'));
const ListaAsistencia = React.lazy(() => import('./views/pages/calificaciones/ListaAsistencia'));
const ListaCiclos = React.lazy(() => import('./views/pages/calificaciones/ListaCiclos'));
const ListaEspecialidades = React.lazy(() => import('./views/pages/calificaciones/ListaEspecialidades'));
const ListaEstadoasistencia = React.lazy(() => import('./views/pages/calificaciones/ListaEstadoasistencia'));
const ActiveSessionPage = React.lazy(() => import ("./views/pages/SesionActiva/SesionActiva"))
const VerificaciónCuenta = React.lazy(() => import ("./views/pages/VerificarCuenta/VerificarCuenta"))

const ListaEstadoNota = React.lazy(() => import('./views/pages/calificaciones/ListaEstadonota'));
const ListaGradoAcademico = React.lazy(() => import('./views/pages/calificaciones/ListaGradoAcademico'));
const ListaGrado = React.lazy(() => import('./views/pages/calificaciones/ListaGrados'));
const ListaParciales = React.lazy(() => import('./views/pages/calificaciones/ListaParciales'));
const ListaPonderaciones = React.lazy(() => import('./views/pages/calificaciones/ListaPonderaciones'));

const ListaProfesor = React.lazy(() => import('./views/pages/calificaciones/ListaProfesores'));
const ListaTipoContrato = React.lazy(() => import('./views/pages/calificaciones/ListaTipoContrato'));

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme');
  const storedTheme = useSelector((state) => state.theme);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1]);
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0];
    if (theme) {
      setColorMode(theme);
    }

    if (!isColorModeSet()) {
      setColorMode(storedTheme);
    }
  }, [isColorModeSet, setColorMode, storedTheme]);

  return (
    <Router>
      <AuthProvider>
        <Suspense
          fallback={
            <div className="pt-3 text-center">
              <CSpinner color="primary" variant="grow" />
            </div>
          }
        >
                  <Routes>
            <Route element={<RutaPublica />}>
              <Route path="/login" element={<Login />} />
              <Route path="/Pre-Registro" element={<PreRegistro />} />
              <Route path="/register" element={<Register />} />
              <Route path="/Olvidecontraseña" element={<ResetPasssword />} />
              <Route path="/confirmacion-email/:correo" element={<ConfirmacionEmail />} />
              <Route path="/correo-verificado" element={<CorreoVerificado />} />
              <Route path="/verificar-cuenta/:token_usuario" element={<VerificarEmail />} />
              <Route path="/404" element={<Page404 />} />
              <Route path="/olvide-password/:token" element={<NuevaContrasena />} />
              <Route path="/500" element={<Page500 />} />
            </Route>

            {/* Rutas protegidas */}
            <Route element={<RutaProtegida />}>
            <Route path="/active-session" element={<ActiveSessionPage />} />
              <Route path="/2fa" element={<TwoAuthFA />} />
              <Route path="/CuentaenRevision" element={<VerificaciónCuenta />} />
              <Route path="/" element={<DefaultLayout />}>
                <Route path="/matricula" element={<Matricula />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Perfil />} />
                <Route path="/ListaActividadesAca" element={<ListaActiviadesAca />} />
                <Route path="/ListaAsignaturas" element={<ListaAsigaturas />} />
                <Route path="/ListaAsistencia" element={<ListaAsistencia />} />
                <Route path="/ListaCiclos" element={<ListaCiclos />} />
                <Route path="/ListaEspecialidades" element={<ListaEspecialidades />} />
                <Route path="/ListaEstadoasistencia" element={<ListaEstadoasistencia />} />
                <Route path="/ListaEstadonota" element={<ListaEstadoNota />} />
                <Route path="/ListaGradoAcademico" element={<ListaGradoAcademico />} />
                <Route path="/ListaGrados" element={<ListaGrado />} />
                <Route path="/ListaParciales" element={<ListaParciales />} />
                <Route path="/ListaPonderaciones" element={<ListaPonderaciones />} />
                <Route path="/ListaProfesores" element={<ListaProfesor />} />
                <Route path="/ListaTipoContrato" element={<ListaTipoContrato />} />
              
              </Route>
            </Route>

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Page404 />} /> {/* Manejo de rutas no encontradas */}
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
};

export default App;
