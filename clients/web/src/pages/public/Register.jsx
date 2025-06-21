import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../provider/AuthProvider';
import LogoLegoAnimation from '../../components/icons/logo/LogoLegoAnimation';
import { motion } from 'framer-motion';
import formatPlaceholder from '../../utils/FormatPlaceholder';

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '', email: '', firstName: '', lastName: '',
    password: '', confirmPassword: ''
  });
  const [error, setError] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = ({ target: { name, value } }) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error[name]) setError((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'; isValid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = 'Minimum 3 characters'; isValid = false;
    }

    if (!formData.email.trim() || !validateEmail(formData.email)) {
      newErrors.email = 'Valid email required'; isValid = false;
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'; isValid = false;
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Min 6 characters'; isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'; isValid = false;
    }

    setError(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validateForm()) return;
    setLoading(true);

    try {
      const { confirmPassword, ...payload } = formData;
      const result = await register(payload);

      if (result.success) {
        alert('Registration successful! Redirecting to login...');
        navigate('/login');
      } else {
        setServerError(
          result.status === 409
            ? 'User already exists'
            : result.error || 'Registration failed'
        );
      }
    } catch {
      setServerError('Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-900 to-slate-950 px-6 py-12 text-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl p-8"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 mb-3">
            <LogoLegoAnimation anim="startup" alt="buildFlow" />
          </div>
          <h2 className="text-4xl font-bold">Sign Up</h2>
        </div>

        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          {['username', 'email'].map((field) => (
            <div key={field}>
              <label className="ml-1 text-sm text-gray-300">{formatPlaceholder(field)}</label>
              <input
                type={field === 'email' ? 'email' : 'text'}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                placeholder={formatPlaceholder(field)}
                disabled={loading}
                className="w-full px-4 py-2 rounded-md bg-slate-800 text-white placeholder-gray-400 outline-none  focus:ring-2 focus:ring-blue-500 mt-2"
              />
              {error[field] && <p className="text-sm text-red-500">{error[field]}</p>}
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            {['firstName', 'lastName'].map((field) => (
              <div key={field}>
                <label className="ml-1 text-sm text-gray-300">{formatPlaceholder(field)}</label>
                <input
                  type="text"
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder={formatPlaceholder(field)}
                  disabled={loading}
                  className="w-full px-4 py-2 rounded-md bg-slate-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 mt-2"
                />
                {error[field] && <p className="text-sm text-red-500">{error[field]}</p>}
              </div>
            ))}
          </div>

          {['password', 'confirmPassword'].map((field) => (
            <div key={field}>
              <label className="ml-1 text-sm text-gray-300">{formatPlaceholder(field)}</label>
              <input
                type="password"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                placeholder={formatPlaceholder(field)}
                disabled={loading}
                className="w-full px-4 py-2 rounded-md bg-slate-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 mt-2"
              />
              {error[field] && <p className="text-sm text-red-500">{error[field]}</p>}
            </div>
          ))}

          {serverError && <p className="text-red-500 text-center">{serverError}</p>}

          <div className="flex justify-center pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="w-48 py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 font-semibold text-white"
            >
              {loading ? 'Registering...' : 'Register'}
            </motion.button>
          </div>

          <p className="text-center text-sm text-gray-400 mt-6">
            <span className="nct text-sm text-gray-500 ">Already have an account?</span><br />
            <a href="/login" className="font-semibold text-primary hover:text-blue-600">Sign In</a>
          </p>
          
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
