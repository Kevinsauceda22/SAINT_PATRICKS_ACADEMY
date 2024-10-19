import React, { Suspense, useEffect } from 'react';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom'; // Importa Navigate
import { useSelector } from 'react-redux';
import { CSpinner, useColorModes } from '@coreui/react';
import './scss/style.scss';

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
const ChangePassword = React.lazy(() => import('./views/pages/components/cambiar password/ChangePassword')); // Importa ChangePassword
const VerificarEmail = React.lazy(() => import('./views/pages/components/verificar cuenta/verificarCuenta'));
const NuevaContrasena = React.lazy(() => import("./views/pages/NewPassword/NewPass")); // Importa NuevaContrasena

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme');
  const storedTheme = useSelector((state) => state.theme);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1]);
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0];
    if (theme) {
      setColorMode(theme);
    }

    if (isColorModeSet()) {
      return;
    }

    setColorMode(storedTheme);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <HashRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          <Route exact path="/login" name="Login Page" element={<Login />} />
          <Route exact path="/register" name="Register Page" element={<Register />} />
          <Route exact path="/confirmacion-email/:correo" name="Confirmacion Email" element={<ConfirmacionEmail />} /> {/* Corregido aquí */}
          <Route exact path="/correo-verificado" name="Correo Verificado" element={<CorreoVerificado />} /> {/* Corregido aquí */}
          <Route exact path="/verificar-cuenta/:token_usuario" name="Verificar Cuenta" element={<VerificarEmail />} /> {/* Corregido aquí */}
          <Route exact path="/404" name="Page 404" element={<Page404 />} />
          <Route exact path="/olvide-password/:token" name="Nueva Contraseña" element={<NuevaContrasena />} /> {/* Corregido aquí */}
          <Route exact path="/500" name="Page 500" element={<Page500 />} />
          <Route exact path="/matricula" name="matricula" element={<Matricula />} />
          <Route path="/cambiar-contrasena/:token" element={<ChangePassword />} />
          <Route path="/" element={<Navigate to="/login" replace />} /> {/* Redirige a /login */}
          <Route path="*" name="Home" element={<DefaultLayout />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
};

export default App;
