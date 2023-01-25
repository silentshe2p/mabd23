import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/contexts';

export const PublicLayout = () => {
  const { user, getLoggedInRedirect } = useAuth();
  const redirect = getLoggedInRedirect();

  return !user ? <Outlet /> : <Navigate to={redirect} />;
};
