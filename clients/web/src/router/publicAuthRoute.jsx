import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from "../provider/AuthProvider";

const AuthRoute = () => {
  const { isAuth, isLoading } = useAuth();

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return isAuth ? <Navigate to="test/projects" replace /> : <Outlet />;
};

export default AuthRoute;
