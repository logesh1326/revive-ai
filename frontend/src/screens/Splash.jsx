import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ShoppingBag, Zap } from 'lucide-react';
import { useAuth } from '../store/AuthContext';

export default function Splash() {
  const navigate = useNavigate();
  const { hasCompletedOnboarding } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasCompletedOnboarding) {
        navigate('/home');
      } else {
        navigate('/login');
      }
    }, 2800);
    return () => clearTimeout(timer);
  }, [navigate, hasCompletedOnboarding]);

  const handleSkip = () => {
    if (hasCompletedOnboarding) {
      navigate('/home');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/40 to-white flex flex-col justify-between items-center px-6 py-10 relative overflow-hidden">
      
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Header Tag */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-100/70 border border-purple-200/80 text-purple-700 text-xs font-bold"
      >
        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
        <span>Next-Gen Grocery Intelligence</span>
      </motion.div>

      {/* Central Hero & Logo */}
      <div className="flex flex-col items-center text-center max-w-sm my-auto">
        
        {/* Animated R Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="relative mb-8"
        >
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-5xl shadow-2xl shadow-purple-600/40 relative">
            <span className="tracking-tighter">R</span>
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute top-4 right-4 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white shadow-xs"
            />
          </div>

          {/* Orbiting Grocery Icons */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
            className="absolute inset-0 -m-6 pointer-events-none"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 text-2xl">🥦</div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-2xl">🍎</div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl">🥛</div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-2xl">⚡</div>
          </motion.div>
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight"
        >
          REVIVE<span className="text-purple-600">AI</span>
        </motion.h1>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-3 space-y-1"
        >
          <p className="text-xl sm:text-2xl font-extrabold text-slate-800 leading-snug">
            Your groceries. <br />
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Smarter.
            </span>
          </p>
          <p className="text-xs sm:text-sm text-slate-500 font-medium pt-1">
            AI-powered shopping made simple.
          </p>
        </motion.div>
      </div>

      {/* Bottom Loading Indicator & Skip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="w-full max-w-xs flex flex-col items-center gap-4"
      >
        {/* Animated Progress Bar */}
        <div className="w-full h-1.5 bg-purple-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 2.5, ease: 'easeInOut' }}
            className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
          />
        </div>

        <button
          onClick={handleSkip}
          className="flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 transition-colors py-1 px-3 rounded-full hover:bg-purple-100/50"
        >
          <span>Get Started</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </div>
  );
}
