import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../provider/authProvider'

const Login = () => {

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [serverError, setServerError] = useState('')
  const { login, isLoading } = useAuth();
  const navigate = useNavigate()

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (error[name]) {
      setError(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setError('');

    try {
      const { confirmPassword, ...LoginData } = formData;
      
      const response = await login(LoginData, { headers: { 'Content-Type': 'application/json' } });
      if (response.status === 200) {
        navigate('/profile');
      } else {
        setError(response.error || 'Неверные учетные данные');
      }
    } catch (err) {
      setError(err.message || 'Ошибка соединения с сервером');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-extrabold text-center text-gray-900">Вход</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Логин
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Войти
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login