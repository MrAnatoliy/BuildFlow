import { createBrowserRouter } from "react-router-dom";

import AuthRoute from "./AuthRoute";
import PublicRoute from "./publicRoute";
import ProtectedRoute from "./protectedRoute";

import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import Profile from "../pages/private/Profile";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthRoute />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
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