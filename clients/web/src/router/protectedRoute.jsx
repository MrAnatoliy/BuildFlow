import { useAuth } from '../provider/authProvider';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { isAuth, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Лоадер пока проверяется авторизация
  }

  return isAuth ? chi : <Navigate to="/login" replace />;
};

export default ProtectedRoute;