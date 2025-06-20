import { useAuth } from "../../../provider/AuthProvider";

import formatUserName from "../../../utils/FormatUserName";

const Header = () => {
    const { isAuth, logout, user } = useAuth();
    return (
        <>
            <nav className="navbar absolute z-100 bg-base-content text-base-100 shadow-sm" style={{padding: "15px 20px"}}>
                <div className="flex-1">
                    <a className="btn btn-ghost text-xl">BuildFlow</a>
                </div>

                <label className="toggle bg-base-100">
                    <input type="checkbox" value="dark" className="theme-controller" />
                    <svg aria-label="sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></g></svg>
                    <svg aria-label="moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></g></svg>
                </label>

                <input type="text" placeholder="Search" className="input" disabled />
        
                <div className="flex gap-2">
                    <span>
                        {!isAuth ? false : formatUserName(user.name)}
                    </span>
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
        
                        </div>
                        <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-content rounded-box mt-7 w-52 p-2 shadow">
                            {!isAuth 
                            ?   <li><a href="/login">Login</a></li> 
                            :   <li>
                                    <div className="justify-between">
                                        <a href="/profile">Profile</a>
                                        <span className="badge">New</span>
                                    </div>
                                </li>
                            }
                            <li><a>Settings</a></li>
                            {!isAuth ? false : <li onClick={logout}><a>Logout</a></li>}
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    )
}

export default Header

