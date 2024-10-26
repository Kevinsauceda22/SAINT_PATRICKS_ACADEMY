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
import { cilBell, cilCreditCard, cilSettings, cilUser, cilLockLocked } from '@coreui/icons';
import CIcon from '@coreui/icons-react';

import avatar8 from './../../assets/images/avatars/user.svg';

const AppHeaderDropdown = () => {
  const isDarkMode = document.body.classList.contains('dark-mode'); // Reemplaza si tienes un contexto de tema global

  const handleLogout = () => {
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
        <CDropdownItem href="#">
          <CIcon icon={cilBell} className="me-2" />
          Notificaciones
        </CDropdownItem>

        {/* Sección Configuraciones */}
        <CDropdownHeader className={`fw-semibold my-2 ${isDarkMode ? 'text-black' : 'text-white'}`} style={{ backgroundColor: '#198754' }}>
          Configuraciones
        </CDropdownHeader>
        <CDropdownItem href="/profile">
          <CIcon icon={cilUser} className="me-2" />
          Perfil
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilSettings} className="me-2" />
          Ajustes
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilCreditCard} className="me-2" />
          Pagos
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
