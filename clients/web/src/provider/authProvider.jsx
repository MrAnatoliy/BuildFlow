import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import mem from "mem";
import axios from 'axios';
import * as jwtDecode from 'jwt-decode';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {

  axios.defaults.withCredentials = true;
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
    console.log('Saving session with tokens:', tokens);
    
    if (!tokens?.accessToken) {
      console.error('Access token is required');
      return;
    }
  
    const session = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken || '', // может быть необязательным
      idToken: tokens.idToken || tokens.accessToken // fallback
    };
  
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('session', JSON.stringify(session));
  
    try {
      const userData = jwtDecode.jwtDecode(session.idToken);
      storage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setAuth(true);
      console.log('Session saved successfully');
    } catch (error) {
      console.error('Failed to decode user data:', error);
      setAuth(true); // все равно считаем авторизованным, если есть accessToken
    }
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
        refresh_token: session.refreshToken // Учитываем формат сервера
      });
  
      // Обрабатываем ответ в том же формате, что и при логине
      const { access_token, refresh_token, id_token } = response.data;
      
      if (!access_token) {
        throw new Error('Не получен новый access token');
      }
  
      const tokens = {
        accessToken: access_token,
        refreshToken: refresh_token || session.refreshToken, // Используем старый, если новый не пришел
        idToken: id_token || session.idToken
      };
  
      saveSession(tokens, !!localStorage.getItem('session'));
      return tokens.accessToken;
    } catch (error) {
      console.error('Refresh token error:', error);
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
      console.log('Initial session from storage:', session);
  
      if (session?.accessToken) {
        try {
          // Декодируем accessToken для проверки срока действия
          const decoded = jwtDecode.jwtDecode(session.accessToken);
          console.log('Decoded token info:', decoded);
  
          const isTokenValid = decoded.exp * 1000 > Date.now();
          console.log(`Token is ${isTokenValid ? 'valid' : 'expired'}`);
  
          if (isTokenValid) {
            setAuth(true);
            // Если есть idToken - декодируем пользователя
            if (session.idToken) {
              const userData = jwtDecode.jwtDecode(session.idToken);
              setUser(userData);
              console.log('User data from idToken:', userData);
            }
          } else {
            console.log('Token expired, attempting refresh...');
            await handleRefreshToken();
          }
        } catch (error) {
          console.error('Token validation failed:', error);
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
      console.log('Login response:', response.data);
  
      const tokens = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        idToken: response.data.id_token || response.data.access_token
      };
  
      if (!tokens.accessToken) {
        throw new Error('Access token is missing in response');
      }
  
      // Сохраняем сессию и ждем завершения
      await new Promise(resolve => {
        saveSession(tokens, rememberMe);
        resolve();
      });
  
      // Явно обновляем состояние перед возвратом
      setAuth(true);
      const userData = getUserFromToken(tokens.idToken);
      setUser(userData);
  
      return { 
        success: true,
        data: response.data,
        status: response.status
      };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed',
        status: error.response?.status
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // 1. Очищаем все хранилища
    localStorage.removeItem('session');
    localStorage.removeItem('user');
    sessionStorage.removeItem('session');
    sessionStorage.removeItem('user');
  
    // 2. Дополнительная очистка на случай, если данные хранились под другими ключами
    const authKeys = ['token', 'auth', 'accessToken', 'refreshToken', 'idToken'];
    authKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  
    // 3. Очищаем состояние приложения
    setAuth(false);
    setUser(null);
  
    // 4. Очищаем cookies (если они использовались)
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=').map(s => s.trim());
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
  
    // 5. Принудительное обновление страницы (опционально)
    window.location.href = '/login'; // или window.location.reload()
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

  // В возвращаемом значении провайдера добавьте:
  console.log('AuthProvider state update:', {
    isAuth,
    user,
    isLoading
  });

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