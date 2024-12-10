import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { CBadge, CNavGroup, CNavItem, CNavLink, CSidebarNav } from '@coreui/react';
import CIcon from '@coreui/icons-react';

export const AppSidebarNav = ({ items }) => {
  const [selectedNavItem, setSelectedNavItem] = useState(null);

  const navLink = (name, icon, badge, isSelected) => {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          transition: 'color 0.3s',
        }}
      >
        {icon && (
          <CIcon
            icon={icon}
            className="nav-icon"
            style={{
              color: isSelected ? '#045528' : '#63947B',
              transition: 'color 0.3s',
            }}
          />
        )}
        {name && <span style={{ marginLeft: icon ? '8px' : '0' }}>{name}</span>}
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
      icon.style.color = hover || isSelected ? '#045528' : '#63947B';
    }

    navItem.style.backgroundColor = hover || isSelected ? '#d4d3ce' : 'transparent';
  };

  const handleNavItemClick = (uniqueId) => {
    setSelectedNavItem(uniqueId);
  };

  const Bullet = () => (
    <span
      className="bullet"
      style={{
        display: 'inline-block',
        borderRadius: '50%',
        width: '8px',
        height: '8px',
        border: '2px solid #045528',
        backgroundColor: 'transparent',
        marginRight: '8px',
      }}
    />
  );

  const navItem = (item, index, indent = false, parentIndex = null) => {
    const { name, badge, icon, to, ...rest } = item;
    const uniqueId = parentIndex !== null ? `${parentIndex}-${index}` : `${index}`;
    const isSelected = selectedNavItem === uniqueId;

    const commonStyles = {
      display: 'flex',
      alignItems: 'center',
      padding: '10px 15px',
      width: '100%',
      transition: 'background-color 0.3s, color 0.3s',
      marginLeft: indent ? '10px' : '0',
      backgroundColor: isSelected ? '#d4d3ce' : 'transparent',
    };

    return (
      <CNavItem key={uniqueId}>
        <CNavLink
          component={NavLink}
          to={to}
          {...rest}
          style={commonStyles}
          onMouseEnter={(e) => applyHoverStyle(e, true, isSelected)}
          onMouseLeave={(e) => applyHoverStyle(e, false, isSelected)}
          onClick={() => handleNavItemClick(uniqueId)}
          className={isSelected ? 'selected' : ''}
        >
          {indent && <Bullet />}
          {navLink(name, icon, badge, isSelected)}
        </CNavLink>
      </CNavItem>
    );
  };

  const navGroup = (item, index) => {
    const { name, icon, items: subItems, ...rest } = item;
    const isSelected = selectedNavItem === `${index}`;

    return (
      <CNavGroup
        key={index}
        toggler={navLink(name, icon, null, isSelected)}
        {...rest}
        style={{
          backgroundColor: 'transparent',
          transition: 'background-color 0.3s ease',
        }}
      >
        {subItems?.map((subItem, subIndex) =>
          subItem.items ? 
            navGroup(subItem, `${index}-${subIndex}`) : 
            navItem(subItem, subIndex, true, index)
        )}
      </CNavGroup>
    );
  };

  return (
    <CSidebarNav>
      <SimpleBar style={{ maxHeight: '100vh' }}>
        {items?.map((item, index) =>
          item.items ? navGroup(item, index) : navItem(item, index)
        )}
      </SimpleBar>
    </CSidebarNav>
  );
};

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      to: PropTypes.string,
      icon: PropTypes.any,
      badge: PropTypes.shape({
        color: PropTypes.string,
        text: PropTypes.string,
      }),
      items: PropTypes.array,
    })
  ).isRequired,
};

export default AppSidebarNav;