import { createBrowserRouter } from "react-router-dom";

import AuthRoute from "./publicAuthRoute";
import PublicRoute from "./publicRoute";
import ProtectedRoute from "./protectedRoute";

import EmailVerification from "../components/hooks/service/EmailVerification";
import RouteErrorBoundary from "../components/RouteErrorBoundary";

import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import Profile from "../pages/private/Profile";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthRoute />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/verify-email",
        element: <EmailVerification />,
      },
    ],
  },
  {
    path: "/",
    element: <PublicRoute />,
    children: [
      {
        index: true,
        element: <div>Home Page</div>,
      },
      {
        path: "/privacy",
        element: <div>Collaboration Page</div>,
      },
      {
        path: "/promo",
        element: <div>Collaboration Page</div>,
      },
    ],
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/profile",
        index: true,
        element: <Profile />,
      },
    ],
  },
]);

export default router;