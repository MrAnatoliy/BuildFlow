// src/provider/AuthProvider.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import memoize from 'memoize';
import axios from 'axios';
import * as jwtDecode from 'jwt-decode';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = 'http://buildflow.api';

  const [isAuth, setAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getUserFromToken = (idToken) => {
    if (!idToken) return null;
    try {
      return jwtDecode.jwtDecode(idToken);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const fetchUserRole = async () => {
    try {
      const res = await axios.get('/role/me');
      console.log('Role response:', res.data);
      setRole(res.data.name);
    } catch (error) {
      console.error('Ошибка при получении роли:', error);
    }
  };

  const getSession = () => {
    const stored = localStorage.getItem('session') ?? sessionStorage.getItem('session');
    return stored ? JSON.parse(stored) : null;
  };

  const saveSession = (tokens, rememberMe = false) => {
    console.log('Saving session with tokens:', tokens);
    if (!tokens?.accessToken) {
      console.error('Access token is required');
      return;
    }
    const session = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken || '',
      idToken: tokens.idToken || tokens.accessToken,
    };
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('session', JSON.stringify(session));

    try {
      const userData = jwtDecode.jwtDecode(session.idToken);
      storage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setAuth(true);
      console.log('Session saved successfully:', userData);
    } catch (error) {
      console.error('Failed to decode user data:', error);
      setAuth(true);
    }
  };

  const clearSession = () => {
    localStorage.removeItem('session');
    localStorage.removeItem('user');
    sessionStorage.removeItem('session');
    sessionStorage.removeItem('user');
    setAuth(false);
    setUser(null);
    setRole(null);
  };

  const handleRefreshToken = async () => {
    const session = getSession();
    if (!session?.refreshToken) {
      clearSession();
      return null;
    }
    try {
      const response = await axios.post('/auth/refresh', {
        refresh_token: session.refreshToken,
      });
      const { access_token, refresh_token, id_token } = response.data;
      if (!access_token) {
        throw new Error('Не получен новый access token');
      }
      const tokens = {
        accessToken: access_token,
        refreshToken: refresh_token || session.refreshToken,
        idToken: id_token || session.idToken,
      };
      saveSession(tokens, !!localStorage.getItem('session'));
      return tokens.accessToken;
    } catch (error) {
      console.error('Refresh token error:', error);
      clearSession();
      return null;
    }
  };

  const memoizedRefreshToken = memoize(handleRefreshToken, {
    maxAge: 10000,
  });

  // Axios interceptors
  useEffect(() => {
    const reqI = axios.interceptors.request.use(
      (config) => {
        const session = getSession();
        if (session?.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const resI = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const newAccessToken = await memoizedRefreshToken();
          if (newAccessToken) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(reqI);
      axios.interceptors.response.eject(resI);
    };
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const session = getSession();
      if (!session?.accessToken) {
        setIsLoading(false);
        return;
      }
      try {
        const userData = jwtDecode.jwtDecode(session.idToken);
        const isTokenValid = userData.exp * 1000 > Date.now();
        if (!isTokenValid) {
          await handleRefreshToken();
        }
        setAuth(true);
        setUser(userData);
        await fetchUserRole();
      } catch (err) {
        console.error('Auth init failed:', err);
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials, rememberMe = false) => {
    try {
      setIsLoading(true);
      const response = await axios.post('/auth/login', credentials);
      const tokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        idToken: response.data.id_token || response.data.access_token,
      };
      saveSession(tokens, rememberMe);
      setAuth(true);
      const userData = getUserFromToken(tokens.idToken);
      setUser(userData);
      await fetchUserRole();
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed',
        status: error.response?.status,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await axios.post('/auth/register', credentials);
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Registration failed',
        status: error.response?.status,
        responseData: error.response?.data,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearSession();
    window.location.href = '/login';
  };

  const checkAuth = useCallback(async () => {
    const session = getSession();
    if (!session?.accessToken) {
      return false;
    }
    try {
      await axios.get('/auth/check');
      return true;
    } catch (error) {
      if (error.response?.status === 401) {
        return (await handleRefreshToken()) !== null;
      }
      return false;
    }
  }, []);

  console.log('AuthProvider state update:', { isAuth, role, user, isLoading });

  return (
    <AuthContext.Provider
      value={{
        isAuth,
        user,
        role,
        isManager: role === 'project_manager',
        isExecutor: role === 'executor',
        isLoading,
        login,
        register,
        logout,
        checkAuth,
        getSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;
