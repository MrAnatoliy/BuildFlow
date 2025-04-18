import { useEffect } from 'react';

import { useError } from '../../../provider/ErrorProvider';

import { AiOutlineCloseCircle } from "react-icons/ai";
import { FaExclamationCircle, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from "framer-motion";

const ErrorDisplay = () => {
  const { error, clearError } = useError();

  const errorIcons = {
    error: <FaExclamationCircle className="mr-2" />,
    warning: <FaExclamationTriangle className="mr-2" />,
    success: <FaCheckCircle className="mr-2" />
  };

  const getStyles = (type) => {
    switch(type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-400',
          text: 'text-green-700'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-400',
          text: 'text-yellow-700'
        };
      default:
        return {
          bg: 'bg-red-50',
          border: 'border-red-400',
          text: 'text-red-700'
        };
    }
  };

  useEffect(() => {
    if (error?.visible) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const styles = getStyles(error?.type || 'error');

  const handleClose = (e) => {
    e.stopPropagation();
    clearError();
  };

  return (
    <AnimatePresence>
      {error?.visible && (
        <motion.div
          key="error-notification"
          initial={{ opacity: 0, y: 20, x: "100%" }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ 
            type: 'spring', 
            damping: 25, 
            stiffness: 300,
            exit: { duration: 0.3 }
          }}
          className="fixed bottom-4 right-4 z-50 w-full max-w-md mb-10 mr-6"
        >
          <motion.div 
            className={`${styles.bg} ${styles.border} ${styles.text} border-2 px-4 py-3 rounded-lg relative shadow-xl`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex justify-between items-center">
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center"
              >
                {errorIcons[error.type]}
                <span className="text-sm">{error.message}</span>
              </motion.div>
              <motion.button 
                onClick={handleClose}
                className={`${styles.text} hover:opacity-70 ml-4 text-lg font-bold`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close notification"
              >
                <AiOutlineCloseCircle />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ErrorDisplay;