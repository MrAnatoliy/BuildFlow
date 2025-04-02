import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import mem from "mem";
import axios from 'axios';
import * as jwtDecode from 'jwt-decode';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {

  axios.defaults.withCredentials = false;
  axios.defaults.baseURL = 'http://buildflow.api';

  const [isAuth, setAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Получение данных пользователя из id токена
  const getUserFromToken = (idToken) => {
    if (!idToken) return null;
    try {
      return jwtDecode.jwtDecode(idToken);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const getSession = () => {
    const session = localStorage.getItem('session') || sessionStorage.getItem('session');
    return session ? JSON.parse(session) : null;
  };

  const saveSession = (tokens, rememberMe = false) => {
    console.log('Saving tokens:', tokens);
    
    if (!tokens?.accessToken || !tokens?.refreshToken || !tokens?.idToken) {
      console.error('Invalid tokens provided');
      return;
    }
  
    const session = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      idToken: tokens.idToken
    };
  
    const storage = rememberMe ? localStorage : sessionStorage;
    console.log(`Using ${rememberMe ? 'localStorage' : 'sessionStorage'}`);
    
    storage.setItem('session', JSON.stringify(session));
  
    const userData = getUserFromToken(tokens.idToken);
    if (userData) {
      storage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
  
    setAuth(true);
  };
  const clearSession = () => {
    localStorage.removeItem('session');
    localStorage.removeItem('user');
    sessionStorage.removeItem('session');
    sessionStorage.removeItem('user');
    setAuth(false);
    setUser(null);
  };

  const handleRefreshToken = async () => {
    const session = getSession();
    if (!session?.refreshToken) {
      clearSession();
      return null;
    }

    try {
      const response = await axios.post('/auth/refresh', {
        refreshToken: session.refreshToken
      });

      const { accessToken, refreshToken, idToken } = response.data;
      saveSession({ accessToken, refreshToken, idToken }, !!localStorage.getItem('session'));
      return accessToken;
    } catch (error) {
      clearSession();
      return null;
    }
  };


  const memoizedRefreshToken = mem(handleRefreshToken, {
    maxAge: 10000 // 10 секунд
  });


  useEffect(() => {

    const requestInterceptor = axios.interceptors.request.use(
      async (config) => {
        const session = getSession();
        if (session?.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
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
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const session = getSession();
      if (session?.accessToken) {
        try {
          const decoded = jwtDecode.jwtDecode(session.accessToken);
          if (decoded.exp * 1000 > Date.now()) {
            setAuth(true);
            setUser(getUserFromToken(session.idToken));
          } else {
            await handleRefreshToken();
          }
        } catch (error) {
          console.error('Token validation error:', error);
          clearSession();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials, rememberMe = false) => {
    try {
      setIsLoading(true);
      const response = await axios.post('/auth/login', credentials);
      
      const { accessToken, refreshToken, idToken } = response.data;
      saveSession({ accessToken, refreshToken, idToken }, rememberMe);
      
      return { 
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false,
        error: error.response?.data?.message || 'Login failed',
        status: error.response?.status
      };
    } finally {
      setIsLoading(false);
    }
  };
  const logout = async () => {
    try {
      const session = getSession();
      if (session?.refreshToken) {

      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearSession();
    }
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
        return await handleRefreshToken() !== null;
      }
      return false;
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuth,
      user,
      isLoading,
      login,
      logout,
      checkAuth,
      getSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;