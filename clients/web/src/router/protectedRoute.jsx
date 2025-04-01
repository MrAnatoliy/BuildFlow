import { useAuth } from '../provider/authProvider';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = () => {
  const { isAuth, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Лоадер пока проверяется авторизация
  }

  return isAuth ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;