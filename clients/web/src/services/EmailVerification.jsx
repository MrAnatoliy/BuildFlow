import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LogoLegoAnimation from '../components/icons/logo/LogoLegoAnimation';
import { motion } from "framer-motion";

axios.defaults.baseURL = "http://buildflow.api";
axios.defaults.withCredentials = true;

function EmailVerification() {
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Функция для проверки, является ли сообщение успешным
  const isSuccessMessage = (msg) => {
    if (!msg) return false;
    const successKeywords = ['success', 'успешно', 'confirmed', 'confirmed!'];
    return successKeywords.some(keyword => msg.toLowerCase().includes(keyword));
  };

  useEffect(() => {
    const verifyEmail = async () => {
      setIsLoading(true);
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const verify_token = searchParams.get('token');

        if (!verify_token || !verify_token.match(/^[0-9a-f-]{36}$/)) {
          throw new Error('Invalid or missing verification token');
        }

        const response = await axios.get(`/auth/verify-email?token=${verify_token}`);

        if (response.status === 200) {
          setMessage('Email has been successfully confirmed!');
          setTimeout(() => navigate('/profile'), 3000);
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message 
          || error.message 
          || 'Verification error. Please try again.';
        
        setMessage(errorMessage);

        if (error.response?.status === 400) {
          setMessage(prev => prev + '. Request a new confirmation link.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [navigate]);

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-900 to-slate-950 px-6 py-12 text-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl shadow-xl p-10 flex flex-col items-center"
      >
        <div className="w-14 h-14 mb-6">
          <LogoLegoAnimation anim="startup" alt="buildFlow" />
        </div>
        <h2 className="text-4xl font-bold mb-8 text-white">Email confirmation</h2>

        {isLoading ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center space-y-3">
            <p className="text-lg text-gray-300">In process...</p>
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center text-lg font-medium ${
              isSuccessMessage(message) ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {message}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default EmailVerification;
