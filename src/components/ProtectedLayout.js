import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { CacheProvider } from '../lib/contexts';
import { useAuth } from '../lib/contexts';

export const ProtectedLayout = () => {
  const { user } = useAuth();
  const { pathname } = useLocation();

  return !user ? (
    <Navigate to="/login" state={{ pathname }} />
  ) : (
    <CacheProvider>
      <Outlet />
    </CacheProvider>
  );
};
