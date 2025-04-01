import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import mem from "mem";
import axios from 'axios';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://buildflow.api';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuth, setAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const getCookie = (name) => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith(`${name}=`))
      ?.split('=')[1];
  };

  const checkAuth = useCallback(async () => {
    try {
      const accessToken = getCookie('access_token');
      
      if (!accessToken) {
        throw new Error('No access token');
      }
  
      const { data } = await axios.get('/auth/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      setUser(data);
      setAuth(true);
    } catch (error) {
      setAuth(false);
      setUser(null);
      
      document.cookie = 'access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'refresh_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshTokenFn = mem(
    async () => {
      try {
        const refreshToken = getCookie('refresh_token');
        
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post("/auth/refresh", 
          { refresh_token: refreshToken },
          { headers: { 'Content-Type': 'application/json' } }
        );
  
        // Проверяем обновление кук
        const newAccessToken = getCookie('access_token');
        if (!newAccessToken) {
          throw new Error('Token refresh failed');
        }
  
        await checkAuth();
        return true;
      } catch (error) {
        setAuth(false);
        setUser(null);
        return false;
      }
    },
    { maxAge: 10000 }
  );

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(config => {
      const accessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];
    
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      
      return config;
    });
  
    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        
        // Обрабатываем только 401 ошибки
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const newAccessToken = await refreshTokenFn();
            if (newAccessToken) {
              originalRequest.headers.Authorization = `Bearer ${getCookie('access_token')}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            console.error('Refresh token failed:', refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  
    checkAuth();
  
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [checkAuth, refreshTokenFn]);

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      
      const response = await axios.post('/auth/login', credentials);
      const { access_token, refresh_token } = response.data;
    
      document.cookie = `access_token=${access_token}; Path=/; Secure; SameSite=None`;
      document.cookie = `refresh_token=${refresh_token}; Path=/; Secure; SameSite=None`;
      
      await checkAuth();
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } finally {
      setAuth(false);
      setUser(null);
    }
  };

  const value = {
    isAuth,
    user,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;



