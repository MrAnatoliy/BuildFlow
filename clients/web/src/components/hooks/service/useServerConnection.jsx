import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNetworkStatus } from './useNetworkStatus';

export function useServerConnection() {
  const [serverOnline, setServerOnline] = useState(true);
  const navigate = useNavigate();
  const isOnline = useNetworkStatus();

  useEffect(() => {
    let intervalId;

    const checkServer = async () => {
      try {
        const response = await fetch('/api/health-check', {
          method: 'HEAD',
          cache: 'no-store'
        });
        setServerOnline(response.ok);
        
        if (response.ok && !window.location.pathname.includes('profile')) {
          navigate('/profile');
        }
      } catch (error) {
        setServerOnline(false);
      }
    };

    if (isOnline) {
      checkServer();
      intervalId = setInterval(checkServer, 10000);
    } else {
      setServerOnline(false);
    }

    return () => clearInterval(intervalId);
  }, [isOnline, navigate]);

  return { serverOnline, isOnline };
}