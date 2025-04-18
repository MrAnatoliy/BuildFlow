import { Link } from "react-router-dom";
import { useAuth } from "../../../provider/AuthProvider";

import formatUserName from "../../../utils/FormatUserName";

import { IconBluePrint, IconContractors, IconDashboard, IconNotification, IconUser } from "../../icons/icons";

const Sidebar = () => {
    const { isAuth, logout, user } = useAuth();
    return (
        <>
            <header className="w-20 h-full flex flex-col justify-between items-center bg-base-100 text-base-content shadow-right z-100 pt-8 pb-5">
                <ul className="w-full h-full flex flex-col justify-start items-center">
                    <li>
                        <IconNotification />
                    </li>
                    <div className="divider mt-5 mb-5 pl-5 pr-5"></div>
                    <li>
                        <IconDashboard />
                    </li>
                    <li className="mt-6 mb-6">
                        <IconBluePrint />
                    </li>
                </ul>
                <ul className="w-full h-full flex flex-col justify-end items-center">
                    <li>
                        <Link to="/blueprint">
                            <IconContractors />
                        </Link>                     
                    </li>
                    <li className="w-11 h-11 flex justify-center items-center rounded-full bg-base bg-accent transition-colors duration-300 ease-in hover:bg-base-100 hover:[&>div>svg>path]:fill-blue-500 mt-5">
                        <IconUser />
                    </li>
                </ul>
            </header>
        </>
    )
}

export default Sidebar

