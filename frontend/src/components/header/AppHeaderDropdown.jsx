import React from 'react'
import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilBell,
  cilCreditCard,
  cilSettings,
  cilUser,
  cilLockLocked,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from './../../assets/images/avatars/user.svg'

const AppHeaderDropdown = () => {
  const isDarkMode = document.body.classList.contains('dark-mode') // Cambia 'dark-mode' según la clase que use tu plantilla

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={avatar8} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        {/* Sección Cuenta */}
        <CDropdownHeader 
          className="fw-semibold mb-2"
          style={{
            backgroundColor: '#198754',
            color: isDarkMode ? '#000000' : '#FFFFFF', // Letra negra en oscuro, blanca en claro
          }}
        >
          Cuenta
        </CDropdownHeader>
        <CDropdownItem href="#">
          <CIcon icon={cilBell} className="me-2" />
          Notificaciones
        </CDropdownItem>

        {/* Sección Configuraciones */}
        <CDropdownHeader 
          className="fw-semibold my-2"
          style={{
            backgroundColor: '#198754',
            color: isDarkMode ? '#000000' : '#FFFFFF', // Letra negra en oscuro, blanca en claro
          }}
        >
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

        {/* Botón Bloquear cuenta */}
        <CDropdownItem href="/login" className={isDarkMode ? 'text-white' : 'text-success'}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Cerrar Sesión
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown