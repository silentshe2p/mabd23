import React from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  useRouteError,
  Route,
  RouterProvider,
} from 'react-router-dom';
import { Game } from './pages/Game';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { NotFound } from './pages/NotFound';
import { AuthLayoutSpWrapper } from './components/AuthLayout';
import { PublicLayout } from './components/PublicLayout';
import { ProtectedLayout } from './components/ProtectedLayout';

const ErrorBoundary = () => {
  let err = useRouteError();
  return <div>{`Something went wrong: ${err.message}`}</div>;
};

export const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route element={<AuthLayoutSpWrapper />} errorElement={<ErrorBoundary />}>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Route>
        <Route element={<ProtectedLayout />}>
          <Route path="/app" element={<Game />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    )
  );
  return <RouterProvider router={router} />;
};
