import React from 'react';
import { useAuth } from '../../provider/AuthProvider';

const Profile = () => {
  const { user, isLoading, isAuth, logout } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuth) {
    return <div>Please log in to see your profile.</div>;
  }

  if (!user) {
    return <div>User data is not available.</div>;
  }

  return (
    <>
        <div className='p-[160px]'>
            <div>My profile</div>
            <div>Name: {user.name || user.username || user.email}</div>
            <div>Email: {user.email}</div>
            <button onClick={logout}>Выйти</button>
        </div>
    </>
  );
};

export default Profile;
