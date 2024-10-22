import { useState, createContext, useEffect } from "react";
import axios from "axios"; // Usamos axios para hacer solicitudes HTTP
import { jwtDecode } from "jwt-decode"; // Importa jwtDecode

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({}); // Estado para almacenar la información del usuario autenticado
  const [loading, setLoading] = useState(true); // Estado para manejar la carga


    useEffect(() => {
      const autenticarUsuario = async () => {
        const token = localStorage.getItem("token");
    
        if (!token) {
          setLoading(false);
          return;
        }
    
        try {
          // Decodificar el token
          const decodedToken = jwtDecode(token);
          console.log("Token decodificado:", decodedToken); // Verificar qué campos tiene el token
          const cod_usuario = decodedToken.cod_usuario; // Asegúrate de que este campo exista en el token
          console.log("Código de usuario decodificado:", cod_usuario); // Verificar el cod_usuario
    
          const config = {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          };
    
          // Hacer la solicitud para obtener el perfil
          const { data } = await axios.get(`http://localhost:4000/api/usuarios/perfil/${cod_usuario}`, config);
          
          setAuth(data);
          console.log("Datos del usuario autenticado:", data);
    
        } catch (error) {
          console.error("Error al autenticar al usuario:", error);
          setAuth({});
          localStorage.removeItem("token");
        } finally {
          setLoading(false);
        }
      };
    
      autenticarUsuario();
    }, []);
    


  return (
    <AuthContext.Provider value={{ auth, setAuth, loading }}>
      {children} {/* Renderizar los hijos que usan este contexto */}
    </AuthContext.Provider>
  );
};

// Exportar el AuthProvider y el AuthContext
export {
  AuthProvider,
  AuthContext
};

export default AuthContext;
