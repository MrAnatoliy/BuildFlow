import React from 'react';
import { useAuth } from '../../provider/AuthProvider';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user, isLoading, isAuth, logout } = useAuth();

  if (isLoading) return <div className="text-center text-white mt-20">Загрузка...</div>;
  if (!isAuth) return <div className="text-center text-white mt-20">Войдите в систему, чтобы просмотреть профиль.</div>;
  if (!user) return <div className="text-center text-white mt-20">Данные пользователя недоступны.</div>;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-900 to-slate-950 text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-xl p-8 space-y-8"
      >
        {/* Верхняя часть с аватаром и заголовком слева */}
        <div className="flex justify-center items-center space-x-6 space-y-7 m">
          <h2 className="text-4xl font-bold">Profile</h2>
        </div>

        {/* Информация слева, вертикально */}
        <div className="flex flex-row">
          <div className='flex justify-center items-center w-full max-h-full'>
            <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-7xl font-bold">
            {user.given_name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className='flex flex-col  space-y-6 text-center'>
            <div>
              <div className="text-4xl text-gray-400 mb-1">Name</div>
              <div className="text-3xl text-gray-600 font-semibold">{user.given_name}</div>
            </div>
            <div>
              <div className="text-4xl text-gray-400 mb-1">Email</div>
              <div className="text-3xl text-gray-600 font-semibold">{user.email}</div>
            </div>
          </div>
        </div>

        {/* Кнопка по центру */}
        <div className="pt-6 flex justify-center items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 transition-colors px-6 py-2 rounded-lg text-white shadow-md"
          >
            Log out
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
