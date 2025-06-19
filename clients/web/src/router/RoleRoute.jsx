import { useAuth } from '../provider/AuthProvider';
import { Navigate } from 'react-router-dom';

const RoleRoute = ({ manager, executor }) => {
  const { isManager, isExecutor } = useAuth();

  if (isManager && manager) return manager;
  if (isExecutor && executor) return executor;

  return <Navigate to="/projects" replace />;
};

export default RoleRoute;