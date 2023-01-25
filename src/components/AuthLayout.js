import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Loader } from 'semantic-ui-react';
import { authUser } from '../lib/api';
import { AuthProvider } from '../lib/contexts';

const resource = authUser();

const AuthLayout = () => {
  const signedInUser = resource.read();

  return (
    <AuthProvider signedInUser={signedInUser}>
      <Outlet />
    </AuthProvider>
  );
};

export const AuthLayoutSpWrapper = () => (
  <Suspense fallback={<Loader active />}>
    <AuthLayout />
  </Suspense>
);
