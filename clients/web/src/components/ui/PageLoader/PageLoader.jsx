import React, { useEffect, useState } from 'react';
import LogoLegoAnimation from '../../icons/logo/LogoLegoAnimation';
import { motion } from 'framer-motion';

const PageLoader = () => {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setVisible(false), 500);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ repeat: Infinity, duration: 1.2, repeatType: 'reverse', ease: 'easeInOut' }}
        className="w-32 h-32"
      >
        <LogoLegoAnimation anim="loading" alt="Loading..." />
      </motion.div>
    </motion.div>
  );
};

export default PageLoader;
