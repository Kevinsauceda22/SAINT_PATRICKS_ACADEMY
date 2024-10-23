import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CSpinner, useColorModes } from '@coreui/react';
import './scss/style.scss';
import { AuthProvider } from "../context/AuthProvider";
import RutaProtegida from './layout/RutaProtegida'; // Importa el componente RutaProtegida

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'));
const Register = React.lazy(() => import('./views/pages/register/Register'));
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'));
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'));
const Matricula = React.lazy(() => import('./views/pages/matricula/matricula'));
const ConfirmacionEmail = React.lazy(() => import('./views/pages/email-confirmation/email-confirmation'));
const CorreoVerificado = React.lazy(() => import('./views/pages/email-check/email-check'));
const VerificarEmail = React.lazy(() => import('./views/pages/components/verificar cuenta/verificarCuenta'));
const NuevaContrasena = React.lazy(() => import("./views/pages/NewPassword/NewPass"));
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'));
const Perfil = React.lazy(() => import('./views/pages/profile/profile'));

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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/confirmacion-email/:correo" element={<ConfirmacionEmail />} />
            <Route path="/correo-verificado" element={<CorreoVerificado />} />
            <Route path="/verificar-cuenta/:token_usuario" element={<VerificarEmail />} />
            <Route path="/404" element={<Page404 />} />
            <Route path="/olvide-password/:token" element={<NuevaContrasena />} />
            <Route path="/500" element={<Page500 />} />

            {/* Rutas protegidas */}
            <Route element={<RutaProtegida />}>
              {/* Envuelve las rutas protegidas en DefaultLayout */}
              <Route path="/" element={<DefaultLayout />}>
                <Route path="/matricula" element={<Matricula />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Perfil />} />
                {/* Agrega más rutas protegidas aquí */}
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
