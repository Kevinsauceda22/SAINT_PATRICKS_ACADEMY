import React from 'react';
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react';
import { cilUser, cilCreditCard, cilLockLocked } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

import avatar8 from './../../assets/images/avatars/user.svg';

const AppHeaderDropdown = () => {
  const isDarkMode = document.body.classList.contains('dark-mode');

  const actualizarOtp = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      return;
    }

    const decodedToken = jwtDecode(token);
    const cod_usuario = decodedToken.cod_usuario;

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      await axios.put(
        `http://74.50.68.87/api/usuarios/actualizarOtp/${cod_usuario}`,
        { otp_verified: 0 },
        config
      );
    } catch (error) {
      console.error("Error al actualizar otp_verified:", error);
    }
  };

  const registrarLogoutBitacora = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const decodedToken = jwtDecode(token);
      
      await axios.post(
        'http://74.50.68.87/api/bitacora/registro',
        {
          cod_usuario: decodedToken.cod_usuario,
          cod_objeto: 76, // Mismo código de objeto que el login
          accion: 'LOGOUT',
          descripcion: `Cierre de sesión del usuario`
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Error al registrar logout en bitácora:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await registrarLogoutBitacora(); // Primero registramos en bitácora
      await actualizarOtp(); // Luego actualizamos otp
    } catch (error) {
      console.error('Error durante el proceso de logout:', error);
    } finally {
      localStorage.removeItem('token'); // Finalmente eliminamos el token
      window.location.href = '/login'; // Y redirigimos
    }
  };

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={avatar8} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        {/* Sección Cuenta */}
        <CDropdownHeader 
          className={`fw-semibold mb-2 ${isDarkMode ? 'text-black' : 'text-white'}`} 
          style={{ backgroundColor: '#198754' }}
        >
          Cuenta
        </CDropdownHeader>

        <CDropdownItem href="/profile">
          <CIcon icon={cilUser} className="me-2" />
          Perfil
        </CDropdownItem>

   

        <CDropdownDivider />

        {/* Botón Cerrar Sesión */}
        <CDropdownItem 
          onClick={handleLogout} 
          className={isDarkMode ? 'text-white' : 'text-success'}
        >
          <CIcon icon={cilLockLocked} className="me-2" />
          Cerrar Sesión
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  );
};

export default AppHeaderDropdown;