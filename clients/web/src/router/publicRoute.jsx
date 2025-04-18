import { Outlet } from "react-router-dom";

import Header from "../components/layout/Header/Header";
import Sidebar from "../components/layout/Sidebar/Sidebar";

const PublicRoute = () => {
  return (
    <>
      <div className="wrapper flex flex-row">
        <Sidebar />
        <Outlet />
      </div>
    </>
  )
};

export default PublicRoute;