import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, logout } = useAuth();

    return (
        <>
            <div>
                <h1>Profile</h1>
                {user && (
                    <>
                    <p>Name: {user.name}</p>
                    <p>Email: {user.email}</p>
                    <button onClick={logout}>Logout</button>
                    </>
                )}
            </div>
        </>
    )
}

export default Profile