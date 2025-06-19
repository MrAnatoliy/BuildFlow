import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../provider/AuthProvider';
import Sidebar from "../components/layout/Sidebar/Sidebar";
const ProtectedRoute = () => {
  const { isAuth } = useAuth();
  return isAuth 
  ? <>
      <Sidebar />
      <div className='wrapper'>
        <Outlet />
      </div>
    </> 
  : <Navigate to="/login" replace />;
};

export default ProtectedRoute