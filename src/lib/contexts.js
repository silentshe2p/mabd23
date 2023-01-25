import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInUser } from './api';
import { removeLSToken } from './utils';

const LOGGED_IN_REDIRECT_DEFAULT = '/app';

const AuthContext = React.createContext();
const CacheContext = React.createContext();

export const AuthProvider = ({ children, signedInUser }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(signedInUser);
  const loggedInRedirect = useRef(LOGGED_IN_REDIRECT_DEFAULT); // where to redirect after user logged in

  const getLoggedInRedirect = () => {
    const redirect = loggedInRedirect.current;
    if (redirect !== LOGGED_IN_REDIRECT_DEFAULT) {
      // reset path after redirection is completed
      loggedInRedirect.current = LOGGED_IN_REDIRECT_DEFAULT;
    }
    return redirect;
  };

  const login = async (providedUser, redirect) => {
    const user = providedUser.trim().replace(/\s\s+/g, ' ');
    try {
      await signInUser(user);
      // instead of "navigate" here, set redirect path which will be handled by PublicLayout
      loggedInRedirect.current = redirect;
      setUser(user);
    } catch (loginError) {
      navigate('/login', {
        // signin failed, navigate back to login with the error
        replace: true,
        state: {
          ...(loginError.status === 401 ? { user } : {}), // for skipping this user who just failed to be signed in
          loginError: { message: loginError.status === 401 ? '不明ユーザー' : 'ログイン失敗', ...loginError },
          pathname: redirect,
        },
      });
    }
  };

  const logout = () => {
    removeLSToken();
    setUser(null);
    navigate('/', { replace: true });
  };
  const value = useMemo(
    () => ({ user, getLoggedInRedirect, login, logout }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const CacheProvider = ({ children }) => {
  const cache = useRef({});

  const getCache = (key) => {
    return cache.current?.[key] || null;
  };

  const setCache = (key, value) => {
    const { current } = cache;
    cache.current = {
      ...current,
      [key]: value
    };
  };

  const value = useMemo(() => ({ getCache, setCache }), []);
  return (
    <CacheContext.Provider value={value}>{children}</CacheContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthContext');
  }
  return context;
};

export const useCache = () => {
  const context = React.useContext(CacheContext);
  if (context === undefined) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
};
