import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, MapPin, ArrowRight, Sparkles, ShoppingBag } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useOrder } from '../store/OrderContext';

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeOrder } = useOrder();

  const orderId = location.state?.orderId || activeOrder?.id || 'RV-10284';

  useEffect(() => {
    // Fire confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Ignore if confetti not loaded
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-slate-50 flex flex-col justify-between items-center p-4 sm:p-6 text-slate-900">
      
      {/* Top Brand Tag */}
      <div className="pt-6 sm:pt-10 flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-extrabold text-sm flex items-center justify-center">
          R
        </div>
        <span className="font-black text-lg text-slate-900 tracking-tight">
          REVIVE<span className="text-purple-600">AI</span>
        </span>
      </div>

      {/* Main Success Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 card-shadow border border-purple-100 my-auto text-center"
      >
        {/* Animated Checkmark Circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 250, damping: 15 }}
          className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-100 shadow-md shadow-emerald-500/10"
        >
          <CheckCircle2 className="w-10 h-10 text-emerald-500 stroke-[2.5]" />
        </motion.div>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Order Placed! 🎉
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Your fresh groceries are already being packed.
        </p>

        {/* Order Details Card */}
        <div className="mt-6 p-4 rounded-2xl bg-purple-50/60 border border-purple-100/80 space-y-3 text-left">
          <div className="flex items-center justify-between pb-2 border-b border-purple-100">
            <span className="text-xs font-bold text-slate-500">Order ID</span>
            <span className="text-xs font-black text-purple-700 bg-white px-2 py-0.5 rounded-md border border-purple-100">
              #{orderId}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-semibold block">Estimated Delivery</span>
              <span className="text-sm font-extrabold text-slate-900">18–24 Minutes (Express)</span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 font-semibold block">Delivering To</span>
              <span className="text-xs font-bold text-slate-800 line-clamp-1">
                {activeOrder?.deliveryAddress || 'Flat 402, Green Glen Heights, Chennai'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-2.5">
          <button
            onClick={() => navigate(`/order-tracking/${orderId}`)}
            className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2"
          >
            <span>Track Live Order</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/home')}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-2xl border border-slate-200 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </motion.div>

      {/* Footer support */}
      <div className="py-4 text-center">
        <p className="text-xs text-slate-400">Need help with your order? ReviveAI Support is active 24/7</p>
      </div>
    </div>
  );
}
