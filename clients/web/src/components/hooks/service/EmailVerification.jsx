import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

axios.defaults.baseURL = "http://buildflow.api";
axios.defaults.withCredentials = true;

function EmailVerification() {
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      setIsLoading(true);
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const verify_token = searchParams.get('token');
        
        console.log('Extracted token:', verify_token);
        
        if (!verify_token || !verify_token.match(/^[0-9a-f-]{36}$/)) {
          throw new Error('Invalid or missing verification token');
        }

        console.log('Making request to:', `/auth/verify-email?token=${verify_token}`);
        
        const response = await axios.get(`/auth/verify-email?token=${verify_token}`);
        
        console.log('Full response:', response);
        
        if (response.status === 200) {
          setMessage('Email успешно подтверждён!');
          setTimeout(() => navigate('/profile'), 3000);
        }
      } catch (error) {
        console.error('Full error details:', error);
        
        const errorMessage = error.response?.data?.message 
          || error.message 
          || 'Ошибка верификации. Пожалуйста, попробуйте ещё раз.';
        
        setMessage(errorMessage);
        
        if (error.response?.status === 400) {
          setMessage(prev => prev + '. Запросите новую ссылку для подтверждения.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [navigate]);

  return (
    <>
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <div style={{ 
      maxWidth: '500px', 
      margin: '2rem auto', 
      padding: '2rem', 
      textAlign: 'center',
      border: '1px solid #eee',
      borderRadius: '8px'
    }}>
      <h2>Подтверждение email</h2>
      {isLoading ? (
        <div>
          <p>Идёт проверка...</p>
          <div className="spinner"></div>
        </div>
      ) : (
        <div style={{ color: message.includes('успешно') ? 'green' : 'red' }}>
          {message}
        </div>
      )}
    </div>
    </>
  );
}

export default EmailVerification;