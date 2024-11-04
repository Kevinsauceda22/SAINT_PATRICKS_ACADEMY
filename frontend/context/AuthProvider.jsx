import { useState, createContext, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom"; // Importa useNavigate

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Inicializa useNavigate

  useEffect(() => {
    const autenticarUsuario = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const decodedToken = jwtDecode(token);
        const cod_usuario = decodedToken.cod_usuario;

        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        };

        const { data } = await axios.get(`http://localhost:4000/api/usuarios/perfil/${cod_usuario}`, config);

        setAuth(data);

        // Verificar si el usuario necesita 2FA
        if (data.is_two_factor_enabled === 1) {
          if (data.otp_verified === 1) {
            // El usuario ha verificado el OTP, se procede con el flujo normal
            handleRedirection(data.cod_estado_usuario);
          } else {
            // El usuario no ha verificado el OTP, redirigir a la página 2FA
            navigate("/2fa");
          }
        } else {
          // Manejo de redirección basado en el estado del usuario si no requiere 2FA
          handleRedirection(data.cod_estado_usuario);
        }
      } catch (error) {
        console.error("Error al autenticar al usuario:", error);
        setAuth(null); // Cambia a null para indicar que no hay usuario autenticado
        if (error.response) {
          setError("Error en el servidor. Por favor, intenta más tarde.");
        } else if (error.request) {
          setError("Error de red. Verifica tu conexión a Internet.");
        } else {
          setError("Error al autenticar. Por favor, vuelve a iniciar sesión.");
        }
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    const handleRedirection = (estadoUsuario) => {
      switch (estadoUsuario) {
        case 1: // Activo
          // Redirigir al dashboard si está en una página de revisión o suspensión
          if (window.location.pathname === "/CuentaSuspendida" || window.location.pathname === "/CuentaenRevision") {
            navigate("/dashboard");
          }
          break;
        case 2: // Cuenta en revisión
          if (window.location.pathname !== "/CuentaenRevision") {
            navigate("/CuentaenRevision");
          }
          break;
        case 3: // Cuenta suspendida
          if (window.location.pathname !== "/CuentaSuspendida") {
            navigate("/CuentaSuspendida");
          }
          break;
        default:
          // Manejo si el estado es inesperado
          setError("Estado de usuario desconocido.");
          break;
      }
    };

    autenticarUsuario();
    
    return () => {
      // Limpieza si es necesario
    };
  }, [navigate]); // Agrega navigate a las dependencias

  return (
    <AuthContext.Provider value={{ auth, setAuth, loading, error }}>
      {loading ? <div>Cargando...</div> : children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
export default AuthContext;
