import { useAuth } from '../../provider/authProvider';

const Profile = () => {
    const { user } = useAuth();

    return (
        <>
            <div>
                <h1>Профиль</h1>
                {user ? (
                    <div>
                    <p>ID: {user.id}</p>
                    <p>Email: {user.email}</p>
                    <p>Имя: {user.name}</p>
                    <p>Роли: {user.roles.join(", ")}</p>
                    </div>
                ) : (
                    <p>Данные не загружены</p>
                )}
            </div>
        </>
    )
}

export default Profile