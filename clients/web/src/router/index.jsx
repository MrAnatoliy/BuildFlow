import { createBrowserRouter, Navigate } from "react-router-dom";

import AuthRoute from "./publicAuthRoute";
import PublicRoute from "./publicRoute";
import ProtectedRoute from "./protectedRoute";

import EmailVerification from "../services/EmailVerification";
import RouteErrorBoundary from "../components/error/RouteErrorBoundary";

import Home from "../pages/public/Home";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import Profile from "../pages/private/Profile";
import TestPage from "../pages/private/testPage";
import Blueprint from "../pages/private/Blueprint";

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
        path: "*",
        element: <Navigate to="/" replace />,
      },
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/privacy",
        element: <div>Collaboration Page</div>,
      },
      {
        path: "/promo",
        element: <div>Collaboration Page</div>,
      },
      {
        path: "/test",
        element: <TestPage />,
      },
      {
        path: "/blueprint",
        element: <Blueprint />,
      },
    ],
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        path: "/profile",
        element: <Profile />,
      },
    ],
  },
]);

export default router;