import { createBrowserRouter } from "react-router-dom";

import ProtectedRoute from "./protectedRoute";
import PublicRoute from "./publicRoute";

import Login from "../pages/public/Login";
import Register from "../pages/public/Register";

const router = createBrowserRouter([
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
    element: <ProtectedRoute />,
    children: [
      {
        path: "/profile",
        index: true,
        element: <div>Это профиль</div>,
      },
    ],
  },
]);

export default router;