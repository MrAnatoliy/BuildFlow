import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from "../provider/AuthProvider";

import Header from '../components/layout/Header/Header';

const AuthRoute = () => {
  const { isAuth } = useAuth();

  if (isAuth) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <>
      <Header />
      <Outlet />
    </>
  )
};

export default AuthRoute;