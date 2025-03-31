import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

// Настраиваем axios для работы с credentials
axios.defaults.withCredentials = true;

const AuthContext = createContext();

const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = 'http://buildflow.api';

  // Проверяем аутентификацию при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/auth/check`);
        setIsAuthenticated(response.data.isAuthenticated);
        setUser(response.data.user);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);


  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;    
          try {
            await axios.post(`${API_BASE_URL}/auth/refresh`);
            return axios(originalRequest);
          } catch (refreshError) {
            await logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      await axios.post(`${API_BASE_URL}/auth/login`, credentials, {headers: { "Content-Type": "application/json" }});
      //const response = await axios.get(`${API_BASE_URL}/auth/check`); // !backend_turn = keepComments : cleanComments
      setIsAuthenticated(true);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider