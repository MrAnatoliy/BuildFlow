import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Добавьте этот импорт

function EmailVerification() {
  const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
  
    useEffect(() => {
      const verifyEmail = async () => {
        setIsLoading(true);
        try {
          const url = window.location.href;
          const verify_token = new URLSearchParams(url.split('?')[1]).get('token');
          
          if (!verify_token) {
            setMessage('Verification token is missing');
            return;
          }

          const response = await axios.get(`/auth/verify-email?token=${verify_token}`);
          console.log('Email verification response:', response);
          
          if (response.status === 200) {
            alert('Успешно')
            setMessage('Email successfully verified!');
            setTimeout(() => navigate('/profile'), 3000);
          }

        } catch (error) {
          console.error('Verification error:', error);
          setMessage(error.response?.data?.message || 'Verification failed');
        } finally {
          setIsLoading(false);
        }
      };
      console.log('Verification token:', verify_token);
      verifyEmail(); // Вызываем функцию
    }, [navigate]); // Добавляем navigate в зависимости useEffect

    return (
      <div className="verification-container">
        {isLoading ? <p className="verification-message">Verifying...</p> : message && <p>{message}</p>}
      </div>
    );
}

export default EmailVerification;