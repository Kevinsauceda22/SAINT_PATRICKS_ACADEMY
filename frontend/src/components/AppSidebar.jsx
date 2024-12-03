import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useColorModes } from '@coreui/react';
import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react';
import logo from 'src/assets/brand/logo_saint_patrick.png';
import navigation from '../_nav';
import { AppSidebarNav } from './AppSidebarNav';
import { usePermission } from '../../context/usePermission';

const NavigationItem = ({ item, onPermissionsCheck }) => {
  const { permissions, canNavigate, canSelect } = usePermission(item.nameobject);
  
  useEffect(() => {
    if (item.nameobject && permissions) {
      onPermissionsCheck(item.nameobject, {
        canNavigate,
        canSelect,
        raw: permissions
      });
    }
  }, [permissions]); // Solo depende de permissions

  return null;
}

const AppSidebar = () => {
  const [navigationPermissions, setNavigationPermissions] = useState({});
  const dispatch = useDispatch();
  const unfoldable = useSelector((state) => state.sidebarUnfoldable);
  const sidebarShow = useSelector((state) => state.sidebarShow);
  const { colorMode } = useColorModes();

  const sidebarBackgroundColor = colorMode === 'pink' ? '#F1F2F7' : 'dark';

  const handlePermissionsCheck = useCallback((nameobject, permissions) => {
    setNavigationPermissions(prev => {
      // Solo actualizar si los permisos son diferentes
      if (JSON.stringify(prev[nameobject]) !== JSON.stringify(permissions)) {
        return {
          ...prev,
          [nameobject]: permissions
        };
      }
      return prev;
    });
  }, []);

  const filterNavigationItems = useCallback((items) => {
    return items.filter((item) => {
      if (item.nameobject) {
        const itemPermissions = navigationPermissions[item.nameobject];
        return itemPermissions?.canNavigate && itemPermissions?.canSelect;
      }
      
      if (item.items) {
        const filteredSubItems = filterNavigationItems(item.items);
        return filteredSubItems.length > 0;
      }
      
      return true;
    });
  }, [navigationPermissions]);

  const filteredNavigation = filterNavigationItems(navigation);

  return (
    <>
      {navigation.map((item) => (
        item.nameobject && (
          <NavigationItem
            key={item.nameobject}
            item={item}
            onPermissionsCheck={handlePermissionsCheck}
          />
        )
      ))}

      <CSidebar
        className="border-end"
        style={{ backgroundColor: sidebarBackgroundColor }}
        position="fixed"
        unfoldable={unfoldable}
        visible={sidebarShow}
      >
        <CSidebarHeader className="border-bottom">
          <CSidebarBrand to="/">
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '50%',
                padding: '5px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '80px',
                height: '80px',
                border: '1px solid #d9d9d9',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)',
              }}
            >
              <img 
                src={logo} 
                alt="Logo" 
                className="sidebar-brand-full" 
                style={{ width: '80%', height: 'auto' }} 
              />
            </div>
          </CSidebarBrand>
          <CCloseButton
            className="d-lg-none"
            onClick={() => dispatch({ type: 'set', sidebarShow: false })}
            color="light"
          />
        </CSidebarHeader>
        
        <AppSidebarNav items={filteredNavigation} />
        
        <CSidebarFooter className="border-top d-none d-lg-flex">
          <CSidebarToggler onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })} />
        </CSidebarFooter>
      </CSidebar>
    </>
  );
};



export default React.memo(AppSidebar);