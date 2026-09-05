import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Plus, Minus, Trash2, ShoppingBag, Sparkles, 
  ShieldCheck, ArrowRight, Tag, Zap, AlertCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import { PRODUCTS } from '../data/mockData';

export default function Cart() {
  const navigate = useNavigate();
  const { currentAddress } = useAuth();
  const { 
    items, updateQuantity, removeFromCart, clearCart, 
    subtotal, deliveryFee, platformFee, grandTotal, totalSavings, totalCount,
    addToCart
  } = useCart();

  const freeDeliveryThreshold = 199;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryPercent = Math.min(100, (subtotal / freeDeliveryThreshold) * 100);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFC] pb-24 md:pb-12 text-slate-900">
        <Navbar />
        <main className="max-w-md mx-auto px-4 pt-16 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4 text-purple-600"
          >
            <ShoppingBag className="w-12 h-12" />
          </motion.div>
          <h2 className="text-xl font-black text-slate-900">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Looks like you haven't added fresh essentials yet. Discover smart AI deals today!
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={() => navigate('/home')}
              className="py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md shadow-purple-600/20"
            >
              Start Shopping
            </button>
            <button
              onClick={() => navigate('/ai-assistant')}
              className="py-3 px-6 bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-xs sm:text-sm rounded-2xl border border-purple-200"
            >
              ✨ Ask ReviveAI to Build Basket
            </button>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFC] pb-28 md:pb-12 text-slate-900">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-3 space-y-4">
        
        {/* Cart Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              My Cart ({totalCount} {totalCount === 1 ? 'item' : 'items'})
            </h1>
          </div>

          <button
            onClick={clearCart}
            className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>

        {/* Free Delivery Goal Tracker */}
        <div className="bg-white rounded-2xl p-3.5 border border-purple-100 card-shadow">
          <div className="flex items-center justify-between text-xs mb-1.5">
            {amountNeededForFreeDelivery === 0 ? (
              <span className="font-extrabold text-emerald-600 flex items-center gap-1">
                🎉 Congratulations! You have unlocked FREE Delivery!
              </span>
            ) : (
              <span className="font-bold text-slate-700">
                Add <span className="text-purple-600 font-extrabold">₹{amountNeededForFreeDelivery}</span> more for <span className="text-emerald-600 font-extrabold">FREE Delivery</span>
              </span>
            )}
            <span className="text-[10px] font-extrabold text-slate-400">
              ₹{subtotal} / ₹{freeDeliveryThreshold}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${freeDeliveryPercent}%` }}
              className="h-full bg-gradient-to-r from-purple-600 to-emerald-500 rounded-full"
            />
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left: Cart Items List */}
          <div className="lg:col-span-7 space-y-3">
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-purple-50 card-shadow divide-y divide-slate-100">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                  >
                    {/* Item Thumbnail */}
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 p-1 border border-slate-100 overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 line-clamp-1">
                        {item.name}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-semibold block">
                        {item.quantity_unit || item.quantity || '1 pack'}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs font-black text-slate-900">
                          ₹{item.price * item.quantity}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          (₹{item.price} each)
                        </span>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center bg-purple-50 text-purple-700 border border-purple-200 rounded-xl overflow-hidden p-0.5">
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-purple-200/60 rounded-lg transition-colors font-bold text-sm"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </motion.button>
                      <span className="w-7 text-center text-xs font-black text-slate-900">
                        {item.quantity}
                      </span>
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-purple-200/60 rounded-lg transition-colors font-bold text-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* AI Smart Savings Suggestion */}
            <div className="bg-gradient-to-r from-purple-50 via-white to-purple-50/50 rounded-2xl p-4 border border-purple-100 flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-black text-purple-900 block">
                  ✨ ReviveAI Savings Detected
                </span>
                <p className="text-[11px] text-slate-600 mt-0.5 font-medium leading-relaxed">
                  You're saving <span className="text-emerald-600 font-extrabold">₹{totalSavings}</span> across these products compared to standard market MRPs.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Bill Summary & Checkout */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-purple-50 card-shadow space-y-3">
              <h3 className="font-extrabold text-sm text-slate-900 pb-2 border-b border-slate-100">
                Bill Summary
              </h3>

              <div className="space-y-2 text-xs text-slate-600 font-semibold">
                <div className="flex justify-between">
                  <span>Item Subtotal</span>
                  <span className="text-slate-900 font-extrabold">₹{subtotal}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-md">
                      FREE
                    </span>
                  ) : (
                    <span className="text-slate-900 font-bold">₹{deliveryFee}</span>
                  )}
                </div>

                <div className="flex justify-between">
                  <span>Platform Fee</span>
                  <span className="text-slate-900 font-bold">₹{platformFee}</span>
                </div>

                {totalSavings > 0 && (
                  <div className="flex justify-between text-emerald-600 font-extrabold bg-emerald-50/80 p-2 rounded-xl border border-emerald-200/60">
                    <span>Total AI Savings</span>
                    <span>- ₹{totalSavings}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 block">To Pay</span>
                  <span className="text-xl font-black text-slate-900">₹{grandTotal}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Delivering to</span>
                  <span className="text-xs font-extrabold text-purple-700">
                    {currentAddress?.type || 'Home'} (15-20 min)
                  </span>
                </div>
              </div>

              {/* Proceed to Checkout */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 mt-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Guarantee */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Safe & contactless delivery • 100% genuine products</span>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Sticky Checkout on Mobile */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-purple-100 z-40">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-400 block font-bold">Total Payable</span>
            <span className="text-base font-black text-slate-900">₹{grandTotal}</span>
          </div>
          <button
            onClick={() => navigate('/checkout')}
            className="flex-1 py-3 px-4 bg-purple-600 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md shadow-purple-600/30 flex items-center justify-center gap-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
