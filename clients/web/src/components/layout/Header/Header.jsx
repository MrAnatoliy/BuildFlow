import { useAuth } from "../../../provider/AuthProvider";
import formatUserName from "../../../utils/FormatUserName";

const Header = () => {
  const { isAuth, logout, user } = useAuth();

  return (
    <nav
      className="navbar fixed top-0 left-0 right-0 z-50 bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-lg px-6 py-4 flex items-center justify-between"
      style={{ minHeight: '64px' }}
    >
      <div className="flex-1">
        <a href="/" className="text-2xl font-extrabold select-none cursor-pointer">
          BuildFlow
        </a>
      </div>

      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Поиск..."
          disabled
          className="input input-bordered input-sm bg-white/10 text-white placeholder-gray-400 cursor-not-allowed w-48"
        />

        <span className="text-lg font-semibold select-none">
          {!isAuth ? null : formatUserName(user.name)}
        </span>

        <div className="dropdown dropdown-end">
          <button
            tabIndex={0}
            className="btn btn-ghost btn-circle avatar"
            aria-label="Профиль пользователя"
          >
            <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-xl">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </button>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-gradient-to-br from-slate-900 to-slate-950 rounded-box mt-2 w-52 p-2 shadow-lg text-white"
          >
            {!isAuth ? (
              <li>
                <a href="/login" className="hover:bg-blue-700 rounded px-2 py-1 block">
                  Войти
                </a>
              </li>
            ) : (
              <>
                <li>
                  <a href="/profile" className="hover:bg-blue-700 rounded px-2 py-1 block flex justify-between items-center">
                    Профиль
                    <span className="badge badge-primary ml-2">New</span>
                  </a>
                </li>
                <li>
                  <a href="/settings" className="hover:bg-blue-700 rounded px-2 py-1 block">
                    Настройки
                  </a>
                </li>
                <li onClick={logout}>
                  <button className="w-full text-left hover:bg-red-600 rounded px-2 py-1 block text-red-400 font-semibold">
                    Выйти
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header;
