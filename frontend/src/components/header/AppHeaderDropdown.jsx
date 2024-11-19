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
  const isDarkMode = document.body.classList.contains('dark-mode'); // Reemplaza si tienes un contexto de tema global

  const actualizarOtp = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      return; // Si no hay token, no se hace nada
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
        `http://localhost:4000/api/usuarios/actualizarOtp/${cod_usuario}`,
        { otp_verified: 0 }, // Establece otp_verified a 0
        config
      );
    } catch (error) {
      console.error("Error al actualizar otp_verified:", error);
    }
  };

  const handleLogout = async () => {
    await actualizarOtp(); // Espera a que se actualice otp_verified
    localStorage.removeItem('token'); // Elimina el token del localStorage
    window.location.href = '/login'; // Redirige al login
  };

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={avatar8} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        {/* Sección Cuenta */}
        <CDropdownHeader className={`fw-semibold mb-2 ${isDarkMode ? 'text-black' : 'text-white'}`} style={{ backgroundColor: '#198754' }}>
          Cuenta
        </CDropdownHeader>

        <CDropdownItem href="/profile">
          <CIcon icon={cilUser} className="me-2" />
          Perfil
        </CDropdownItem>

        <CDropdownItem href="/MisPagos">
          <CIcon icon={cilCreditCard} className="me-2" />
          Mis Pagos
        </CDropdownItem>

        <CDropdownDivider />

        {/* Botón Cerrar Sesión */}
        <CDropdownItem onClick={handleLogout} className={isDarkMode ? 'text-white' : 'text-success'}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Cerrar Sesión
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  );
};

export default AppHeaderDropdown;
