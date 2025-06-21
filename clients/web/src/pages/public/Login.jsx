import { useAuth } from '../../provider/AuthProvider';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoLegoAnimation from '../../components/icons/logo/LogoLegoAnimation';
import { motion } from 'framer-motion';
import { useError } from '../../provider/ErrorProvider';
import { getLoginErrorMessage } from '../../components/error/ErrorHander/ErrorHandler';

const Login = () => {
  const { login } = useAuth();
  const { setErrorAutoClose } = useError();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(formData, rememberMe);

      if (result.success) {
        setErrorAutoClose('Вход выполнен успешно!', 'success', 2000);
        setTimeout(() => navigate('/projects'), 2000);
      } else {
        const errorMessage = getLoginErrorMessage(result.error);
        setErrorAutoClose(errorMessage, 'error', 5000);
      }
    } catch (err) {
      const errorMessage = getLoginErrorMessage(err);
      setErrorAutoClose(errorMessage, 'error', 5000);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-900 to-slate-950 px-6 py-12 text-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 mb-3">
            <LogoLegoAnimation anim="startup" alt="buildFlow" />
          </div>
          <h2 className="text-4xl font-bold text-center">Sign In</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="ml-1 text-sm text-gray-300">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-2 rounded-md bg-slate-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 mt-2"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="ml-1 text-sm text-gray-300">
                Password
              </label>
              <a
                href="#"
                className="text-sm text-blue-400 hover:underline hover:text-blue-500 mr-2"
              >
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className="w-full px-4 py-2 rounded-md bg-slate-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 mt-2"
            />
          </div>

          <div className="flex items-center mt-2 ml-2">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 bg-slate-700 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
              Remember me
            </label>
          </div>

          <div className="flex justify-center pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="w-48 py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 font-semibold text-white"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Not a member?{' '}
          <a href="/register" className="text-blue-400 hover:underline">
            Register
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
