import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index';

const DefaultLayout = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          {/* Aquí se renderizarán los componentes secundarios */}
          <Outlet />
        </div>
        <AppFooter />
      </div>
    </div>
  );
}

export default DefaultLayout;
