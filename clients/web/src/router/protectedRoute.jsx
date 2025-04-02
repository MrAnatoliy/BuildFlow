import { useAuth } from '../provider/authProvider';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const { isAuth, isLoading } = useAuth();

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;