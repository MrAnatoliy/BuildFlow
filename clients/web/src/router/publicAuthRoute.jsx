import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from "../provider/authProvider";

const AuthRoute = () => {
  const { isAuth, isLoading } = useAuth();

  if (isLoading) {
    return <div>Проверка авторизации...</div>;
  }

  if (isAuth) {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
};

export default AuthRoute;