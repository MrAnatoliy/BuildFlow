import { Outlet } from "react-router-dom";
import Header from '../components/layout/Header/Header';

const PublicRoute = () => { 
    return (
        <>
            <Header />
            <Outlet />
        </>
    )
};

export default PublicRoute;