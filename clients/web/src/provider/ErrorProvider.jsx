import React, { createContext, useState, useContext } from "react";

const ErrorContext = createContext();

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState({ 
    message: '', 
    type: 'error', // 'error' | 'warning' | 'success'
    visible: false 
  });

  const clearError = () => {
    setError({ message: '', type: 'error', visible: false });
  };

  const setErrorAutoClose = (message, type = 'error', timeout = 5000) => {
    setError({
      message,
      type,
      visible: true
    });
    
    if (timeout > 0) {
      setTimeout(clearError, timeout);
    }
  };
  
  return (
    <ErrorContext.Provider value={{ 
      error, 
      setError: setErrorAutoClose,
      setErrorAutoClose,
      clearError 
    }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
    const context = useContext(ErrorContext)
    if (!context) {
      throw new Error('useError must be used within an ErrorProvider')
    }
    return context;
  }