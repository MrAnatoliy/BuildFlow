import { useAuth } from '../../provider/authProvider';

const Profile = () => {
    
    const IGNORED_ROLES = ["offline_access", "uma_authorization", "default-roles-buildflow-realm"];

    const { user } = useAuth();

    if (!user) {
        return <p>Данные не загружены</p>;
    }

    const filteredRoles = user.roles?.filter(role => !IGNORED_ROLES.includes(role)) || [];

    return (
        <div>
            <h1>Профиль</h1>
            <div>
                <p>ID: {user.id}</p>
                <p>Email: {user.email}</p>
                <p>Имя: {user.name}</p>
                {filteredRoles.length > 0 ? (
                    <p>Роли: {filteredRoles.join(", ")}</p>
                ) : (
                    <p>Нет доступных ролей</p>
                )}
            </div>
        </div>
    );
};

export default Profile;