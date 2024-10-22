import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { CBadge, CNavLink, CSidebarNav } from '@coreui/react';
import CIcon from '@coreui/icons-react';

export const AppSidebarNav = ({ items }) => {
  const [selectedNavItem, setSelectedNavItem] = useState(null); // Estado para el ítem seleccionado

  const navLink = (name, icon, badge, isSelected, indent = false) => {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          transition: 'color 0.3s',
        }}
      >
        <CIcon
          icon={icon}
          className="nav-icon"
          style={{
            color: isSelected ? '#045528' : '#63947B', // Cambia el color del ícono basado en si está seleccionado
            transition: 'color 0.3s',
          }}
        />
        {name && name}
        {badge && (
          <CBadge color={badge.color} className="ms-auto">
            {badge.text}
          </CBadge>
        )}
      </div>
    );
  };

  const applyHoverStyle = (e, hover, isSelected) => {
    const icon = e.currentTarget.querySelector('.nav-icon');
    const navItem = e.currentTarget;

    if (icon) {
      icon.style.color = hover || isSelected ? '#045528' : '#63947B'; // Mantener color en hover o selección
    }

    if (hover || isSelected) {
      navItem.style.backgroundColor = '#d4d3ce'; // Mantiene color de fondo si está en hover o seleccionado
    } else {
      navItem.style.backgroundColor = 'transparent'; // Restaura color de fondo si no está seleccionado ni en hover
    }
  };

  const handleNavItemClick = (e, uniqueId) => {
    setSelectedNavItem(uniqueId); // Actualiza el ítem seleccionado
  };

  const navItem = (item, index, indent = false, parentIndex = null) => {
    const { component, name, badge, icon, ...rest } = item;
    const Component = component;
    // Crear un identificador único para el ítem basado en el índice del grupo y del ítem
    const uniqueId = parentIndex !== null ? `${parentIndex}-${index}` : index;
    const isSelected = selectedNavItem === uniqueId; // Verifica si este ítem está seleccionado

    return (
      <Component as="div" key={uniqueId}>
        {rest.to || rest.href ? (
          <CNavLink
            {...(rest.to && { as: NavLink })}
            {...rest}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 15px',
              width: '100%',
              transition: 'background-color 0.3s, color 0.3s',
              marginLeft: indent ? '10px' : '0', // Menos sangría para sub-ítems
              backgroundColor: isSelected ? '#d4d3ce' : 'transparent', // Color de fondo si está seleccionado
            }}
            onMouseEnter={(e) => applyHoverStyle(e, true, isSelected)}
            onMouseLeave={(e) => applyHoverStyle(e, false, isSelected)}
            onClick={(e) => handleNavItemClick(e, uniqueId)} // Maneja el clic en el ítem de navegación
          >
            {indent && (
              <span
                className="bullet"
                style={{
                  display: 'inline-block',
                  borderRadius: '50%',
                  width: '8px',
                  height: '8px',
                  border: '2px solid #045528', // Color del borde
                  backgroundColor: 'transparent', // Sin fondo
                  marginRight: '8px', // Espaciado
                }}
              ></span>
            )}
            {navLink(name, icon, badge, isSelected, indent)}
          </CNavLink>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 15px',
              width: '100%',
              marginLeft: indent ? '10px' : '0', // Menos sangría para sub-ítems
              backgroundColor: isSelected ? '#d4d3ce' : 'transparent', // Color de fondo si está seleccionado
            }}
            onMouseEnter={(e) => applyHoverStyle(e, true, isSelected)}
            onMouseLeave={(e) => applyHoverStyle(e, false, isSelected)}
            onClick={(e) => handleNavItemClick(e, uniqueId)} // Maneja el clic en el ítem de navegación
          >
            {indent && (
              <span
                className="bullet"
                style={{
                  marginRight: '8px',
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%', // Cambia esto para un estilo diferente
                  backgroundColor: '#045528', // Color de la viñeta
                }}
              ></span>
            )}
            {navLink(name, icon, badge, isSelected, indent)}
          </div>
        )}
      </Component>
    );
  };

  const navGroup = (item, index) => {
    const { component, name, icon, items, to, ...rest } = item;
    const Component = component;

    return (
      <Component
        as="div"
        key={index}
        toggler={navLink(name, icon, selectedNavItem === `${index}`)} // Cambia el ícono si está seleccionado
        {...rest}
        style={{
          backgroundColor: 'transparent', // Sin color de fondo
          transition: 'background-color 0.3s ease',
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = 'transparent')} // Sin color en hover
        onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')} // Sin restauración de color
      >
        {item.items?.map((subItem, subIndex) =>
          subItem.items ? navGroup(subItem, subIndex) : navItem(subItem, subIndex, true, index),
        )}
      </Component>
    );
  };

  return (
    <CSidebarNav as={SimpleBar}>
      {items &&
        items.map((item, index) => (item.items ? navGroup(item, index) : navItem(item, index)))}
    </CSidebarNav>
  );
};

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
};
