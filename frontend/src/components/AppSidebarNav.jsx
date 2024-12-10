import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import { CBadge, CNavGroup, CNavItem, CNavLink, CSidebarNav } from '@coreui/react';
import CIcon from '@coreui/icons-react';

export const AppSidebarNav = ({ items }) => {
  const location = useLocation();
  const [selectedNavItem, setSelectedNavItem] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  const navLink = (name, icon, badge, isSelected) => {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          transition: 'color 0.3s',
          width: '100%'
        }}
      >
        {icon && (
          <CIcon
            icon={icon}
            className="nav-icon"
            style={{
              color: isSelected ? '#045528' : '#63947B',
              transition: 'color 0.3s',
              marginRight: '8px'
            }}
          />
        )}
        <span style={{ flex: 1 }}>{name}</span>
        {badge && (
          <CBadge color={badge.color} className="ms-auto">
            {badge.text}
          </CBadge>
        )}
      </div>
    );
  };

  const handleGroupClick = (index) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const navItem = (item, index, indent = false, parentIndex = null) => {
    const isSelected = location.pathname === item.to;
    const uniqueId = parentIndex ? `${parentIndex}-${index}` : `${index}`;
    
    return (
      <CNavItem key={uniqueId} role="none">
        <NavLink
          to={item.to}
          className={({ isActive }) => 
            `nav-link ${isActive ? 'active' : ''}`
          }
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            padding: '10px 15px',
            width: '100%',
            cursor: 'pointer',
            marginLeft: indent ? '20px' : '0',
            backgroundColor: isActive ? '#d4d3ce' : 'transparent',
            color: 'inherit',
            textDecoration: 'none',
            transition: 'all 0.3s ease'
          })}
          role="menuitem"
        >
          {indent && (
            <span
              className="bullet"
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                border: '2px solid #045528',
                backgroundColor: 'transparent',
                marginRight: '8px'
              }}
            />
          )}
          {navLink(item.name, item.icon, item.badge, isSelected)}
        </NavLink>
      </CNavItem>
    );
  };

  const navGroup = (item, index) => {
    const isExpanded = expandedGroups.has(index);
    const hasActiveChild = item.items?.some(
      (subItem) => location.pathname === subItem.to
    );

    return (
      <CNavGroup
        key={index}
        visible={isExpanded || hasActiveChild}
        toggler={
          <div
            onClick={() => handleGroupClick(index)}
            style={{
              cursor: 'pointer',
              padding: '10px 15px',
              backgroundColor: hasActiveChild ? '#d4d3ce' : 'transparent'
            }}
          >
            {navLink(item.name, item.icon, null, hasActiveChild)}
          </div>
        }
      >
        {item.items?.map((subItem, subIndex) =>
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
        <div role="menu">
          {items?.map((item, index) =>
            item.items ? navGroup(item, index) : navItem(item, index)
          )}
        </div>
      </SimpleBar>
    </CSidebarNav>
  );
};

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    icon: PropTypes.any,
    badge: PropTypes.shape({
      color: PropTypes.string,
      text: PropTypes.string,
    }),
    items: PropTypes.array,
    to: PropTypes.string,
  })).isRequired,
};

export default AppSidebarNav;