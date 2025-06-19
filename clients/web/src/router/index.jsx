import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthRoute from "./publicAuthRoute";
import PublicRoute from "./publicRoute";
import ProtectedRoute from "./protectedRoute";
import RouteErrorBoundary from "../components/error/RouteErrorBoundary";

import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import EmailVerification from "../services/EmailVerification";

import Profile from "../pages/private/Profile";
import Projects from "../pages/private/Projects";

import ManagerDashboard from "../pages/private/ManagerDashboard";
import ExecutorDashboard from "../pages/private/ExecutorDashboard";
import StageDashboard from "../pages/private/StageDashboard";
import ProjectSettings from "../pages/private/ProjectSettings";

import BlueprintView from "../pages/private/_Manager/BlueprintView";
import ContractorsView from "../pages/private/_Manager/ContractorsView";

import RoleRoute from "./RoleRoute";

const router = createBrowserRouter([
  {
    element: <AuthRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/verify-email", element: <EmailVerification /> },
    ],
  },

  {
    element: <PublicRoute />,
    children: [
      {
        path: "/",
        index: true,
        element: <div>Home Page</div>,
      },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        index: true,
        element: <Navigate to="/projects" replace />,
      },
      {
        path: "/projects",
        element: <Projects />, // отображает все проекты
      },
      {
        path: "/project/:projectId",
        element: (
          <RoleRoute
            manager={<StageDashboard />} // отображает этапы проекта 
            executor={<ExecutorDashboard />} // отображает таски проекта по executorId 
          />
        ),
      },
      {
        path: "/project/:projectId/stage/:stageId",
        element: (
          <RoleRoute
            manager={<ManagerDashboard />} // отображает этап с задачами
            executor={<Navigate to="/projects" replace />} // для executor запрещено
          />
        ),
      },
      {
        path: "/project/:projectId/blueprint",
        element: (
          <RoleRoute
            manager={<BlueprintView />}
            executor={<Navigate to="/projects" replace />} // для executor запрещено
          />
        ),
      },
      {
        path: "/project/:projectId/contractors",
        element: (
          <RoleRoute
            manager={<ContractorsView />}
            executor={<Navigate to="/projects" replace />} // для executor запрещено
          />
        ),
      },
      {
        path: "/project/:projectId/settings",
        element: (
          <RoleRoute
            manager={<ProjectSettings />}
            executor={<Navigate to="/projects" replace />} // для executor запрещено
          />
        ),
      },
      {
        path: "/profile",
        element: <Profile />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/projects" replace />,
  },
]);

export default router;
