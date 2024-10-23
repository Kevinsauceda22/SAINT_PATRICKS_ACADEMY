import { useState, createContext, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      } catch (error) {
        console.error("Error al autenticar al usuario:", error);
        setAuth({});
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

    autenticarUsuario();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthProvider, AuthContext };
export default AuthContext;
