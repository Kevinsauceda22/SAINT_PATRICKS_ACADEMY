// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Crear el contexto
export const AuthContext = createContext();

// Crear el proveedor del contexto
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Estado para almacenar el usuario autenticado
  const [loading, setLoading] = useState(true); // Estado de carga
  const navigate = useNavigate();

  // Función para iniciar sesión
  const login = async (identificador, contraseña_usuario) => {
    try {
      const response = await axios.post('http://localhost:4000/api/usuarios/login', {
        identificador,
        contraseña_usuario
      });

      const { token, usuario } = response.data;

      // Guardar el token en el localStorage
      localStorage.setItem('token', token);

      // Guardar los datos del usuario en el estado
      setUser(usuario);

      // Redirigir al dashboard
      navigate('/dashboard');
      return true;
    } catch (error) {
      console.error("Error en el login", error);
      return false;
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  // Función para verificar si el usuario está autenticado
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          const response = await axios.get('http://localhost:4000/api/usuarios/verificar-token', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          setUser(response.data.usuario);
        } catch (error) {
          console.error("Error verificando el token", error);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
