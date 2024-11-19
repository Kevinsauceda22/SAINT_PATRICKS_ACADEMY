import React, { useState, useEffect } from 'react';
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

const AppSidebar = () => {
  const [navigationPermissions, setNavigationPermissions] = useState({});

  const dispatch = useDispatch();
  const unfoldable = useSelector((state) => state.sidebarUnfoldable);
  const sidebarShow = useSelector((state) => state.sidebarShow);
  const { colorMode } = useColorModes();

  // Determinar el color del sidebar según el modo actual
  const sidebarBackgroundColor = colorMode === 'pink' ? '#F1F2F7' : 'dark';

  const toggleSidebar = () => {
    dispatch({ type: 'set', sidebarShow: !sidebarShow });
  };

  useEffect(() => {
    const fetchNavigationPermissions = async () => {
      const permissions = {};
      for (const item of navigation) {
        if (item.nameobject) {
          const { canNavigate } = await usePermission(item.nameobject);
          permissions[item.nameobject] = canNavigate;
        }
      }
      setNavigationPermissions(permissions);
    };
    fetchNavigationPermissions();
  }, []);

  const filteredNavigation = navigation.filter((item) => {
    if (item.nameobject && navigationPermissions[item.nameobject] !== undefined) {
      console.log(`Revisando '${item.name}' (${item.nameobject}):`, navigationPermissions[item.nameobject]);
      return navigationPermissions[item.nameobject];
    }
    console.log(`Agregando '${item.name}' (sin permiso definido)`);
    return true;
  });

  return (
    <CSidebar
      className="border-end"
      style={{ backgroundColor: sidebarBackgroundColor }} // Color dinámico
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
              padding: '5px', // Reducción del espaciado interno
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '80px', // Tamaño reducido
              height: '80px', // Tamaño reducido
              border: '1px solid #d9d9d9', // Borde con color
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)', // Sombra interna
            }}
          >
            <img src={logo} alt="Logo" className="sidebar-brand-full" style={{ width: '80%', height: 'auto' }} />
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
        <CSidebarToggler onClick={toggleSidebar} />
      </CSidebarFooter>
    </CSidebar>
  );
};

export default React.memo(AppSidebar);