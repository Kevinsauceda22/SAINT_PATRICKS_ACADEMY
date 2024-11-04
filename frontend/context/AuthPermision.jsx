import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthContext from '../context/AuthProvider'; // Asegúrate de importar el contexto de autenticación
import axios from 'axios';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
    const { auth } = useContext(AuthContext);
    const [permissions, setPermissions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPermissions = async () => {
            if (!auth) {
                setLoading(false);
                return; // Si no hay usuario autenticado, no hacemos nada
            }

            try {
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                };

                // Aquí llamas a la API que has creado para obtener el rol y los datos del usuario
                const { data } = await axios.get(`http://localhost:4000/api/usuarios/rol-correo/${auth.cod_usuario}`, config);
                setPermissions(data); // Guarda la información en el estado
            } catch (error) {
                console.error('Error al obtener los permisos:', error);
                setError('Error al obtener permisos.'); // Manejo de errores
            } finally {
                setLoading(false);
            }
        };

        fetchPermissions();
    }, [auth]); // Dependencia en el contexto de autenticación

    return (
        <PermissionContext.Provider value={{ permissions, loading, error }}>
            {loading ? <div>Cargando permisos...</div> : children}
        </PermissionContext.Provider>
    );
};

export const usePermissions = () => {
    return useContext(PermissionContext);
};

export default PermissionContext;
