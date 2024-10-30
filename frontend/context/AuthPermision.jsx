// src/context/PermissionContext.js
import React, { createContext, useContext, useState } from 'react';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);

  const updatePermissions = (newPermissions) => {
    setPermissions(newPermissions);
  };

  return (
    <PermissionContext.Provider value={{ permissions, updatePermissions }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  return useContext(PermissionContext);
};
