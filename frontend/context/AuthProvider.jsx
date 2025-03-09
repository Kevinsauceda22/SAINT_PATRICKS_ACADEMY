import { useState, createContext, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

        const { data } = await axios.get(
          `http://74.50.68.87:4000/api/usuarios/perfil/${cod_usuario}`,
          config
        );

        setAuth(data);

        // Primero verificamos si tiene contraseña temporal
        if (data.password_temporal === 1) {
          if (window.location.pathname !== "/NuevaContraseña") {
            navigate("/NuevaContraseña");
          }
          setLoading(false);
          return; // Importante: retornamos aquí para evitar otras redirecciones
        }

        // Si no tiene contraseña temporal, continuamos con el flujo normal
        if (data.is_two_factor_enabled === 1) {
          if (data.otp_verified === 1) {
            handleRedirection(data.cod_estado_usuario, data.datos_completados);
          } else {
            navigate("/2fa");
          }
        } else {
          handleRedirection(data.cod_estado_usuario, data.datos_completados);
        }
      } catch (error) {
        console.error("Error al autenticar al usuario:", error);
        setAuth(null);
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

    const handleRedirection = (estadoUsuario, datosCompletados) => {
      // Si el usuario está en /NuevaContrasena pero no tiene password_temporal, 
      // redirigir al dashboard
      if (
        window.location.pathname === "/NuevaContraseña" && 
        auth?.password_temporal !== 1
      ) {
        navigate("/dashboard");
        return;
      }

      switch (estadoUsuario) {
        case 1: // Activo
          if (!datosCompletados) {
            if (window.location.pathname !== "/completarDatos") {
              navigate("/completarDatos");
            }
          } else {
            if (
              window.location.pathname === "/CuentaSuspendida" ||
              window.location.pathname === "/CuentaenRevision" ||
              window.location.pathname === "/completarDatos"
            ) {
              navigate("/dashboard");
            }
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
          setError("Estado de usuario desconocido.");
          break;
      }
    };

    autenticarUsuario();
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ auth, setAuth, loading, error }}>
      {loading ? <div>Cargando...</div> : children}
    </AuthContext.Provider>
  );
};

// Componente NuevaContrasena
const NuevaContrasena = () => {
  const { auth, setAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://74.50.68.87:4000/api/usuarios/actualizar-password-primer-ingreso",
        {
          cod_usuario: auth.cod_usuario,
          nueva_contraseña: password
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      if (response.data.status) {
        // Actualizar el estado local
        setAuth(prev => ({
          ...prev,
          password_temporal: 0
        }));

        // Redirigir al dashboard
        navigate("/dashboard");
      }
    } catch (error) {
      setError(error.response?.data?.mensaje || "Error al actualizar la contraseña");
    }
  };

  return (
    <div className="nueva-contrasena-container">
      <h2>Establece tu Nueva Contraseña</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nueva Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Confirmar Contraseña</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Cambiar Contraseña</button>
      </form>
    </div>
  );
};

export { AuthProvider, AuthContext };
export default AuthContext;