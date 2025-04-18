import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from "../provider/AuthProvider";

import Sidebar from '../components/layout/Sidebar/Sidebar';

const ProtectedRoute = () => {
  const { isAuth, isLoading, user } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute check:', { isAuth, isLoading });

  if (isLoading) {
    return <div>Проверка авторизации...</div>;
  }

  if (!isAuth) {
    console.log('Redirecting to login, current auth state:', { isAuth, user });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <>
      <Sidebar />
      <Outlet />
    </>
  )
};

export default ProtectedRoute