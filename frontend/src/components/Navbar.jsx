import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, ShoppingBag, Sparkles, User, Search, Camera, ChefHat } from 'lucide-react';
import { useAuth } from '../store/AuthContext';
import { useCart } from '../store/CartContext';
import AddressModal from './AddressModal';

export default function Navbar() {
  const { currentAddress, user } = useAuth();
  const { totalCount, grandTotal } = useCart();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-purple-50 shadow-xs transition-all">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          
          {/* Brand Logo & Location */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo */}
            <Link to="/home" className="flex items-center gap-2 group flex-shrink-0">
              <motion.div 
                whileHover={{ scale: 1.05, rotate: 3 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-purple-500/20"
              >
                <span className="tracking-tighter">R</span>
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full ml-0.5 -mt-3"></span>
              </motion.div>
              <div className="hidden sm:block">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight flex items-center gap-1">
                  REVIVE<span className="text-purple-600 font-black">AI</span>
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-purple-600 -mt-1">
                  Smart Grocery
                </span>
              </div>
            </Link>

            {/* Divider */}
            <div className="hidden md:block h-7 w-[1px] bg-slate-200 mx-1"></div>

            {/* Persistent Delivery Address */}
            <button
              onClick={() => setIsAddressModalOpen(true)}
              className="flex items-center gap-1.5 text-left p-1.5 rounded-xl hover:bg-purple-50/80 transition-colors border border-transparent hover:border-purple-100 group max-w-[180px] sm:max-w-[260px]"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-purple-600" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    Delivering to <span className="text-purple-700 font-extrabold">{currentAddress?.type || 'Home'}</span>
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 transition-transform group-hover:translate-y-0.5" />
                </div>
                <p className="text-[11px] text-slate-500 truncate font-medium">
                  {currentAddress?.area ? `${currentAddress.area}, ${currentAddress.city}` : 'Select your address'}
                </p>
              </div>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Scan Grocery List Quick Pill */}
            <Link
              to="/scan-grocery-list"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold text-xs hover:bg-purple-100 transition-all shadow-2xs"
            >
              <Camera className="w-3.5 h-3.5 text-purple-600" />
              <span>📝 Scan List</span>
            </Link>

            {/* AI Assistant Quick Pill */}
            <Link
              to="/ai-assistant"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold text-xs shadow-sm hover:shadow-md hover:shadow-purple-500/25 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
              <span>Ask ReviveAI</span>
            </Link>

            {/* Search Quick Icon (Desktop/Tablet) */}
            <Link
              to="/search"
              aria-label="Search"
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors relative"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Profile */}
            <Link
              to="/profile"
              aria-label="Profile"
              className="p-1 rounded-full border-2 border-purple-200 hover:border-purple-500 transition-colors"
            >
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                alt="Profile"
                className="w-7 h-7 rounded-full object-cover"
              />
            </Link>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShoppingBag className="w-4 h-4" />
              <div className="flex flex-col text-left leading-none">
                <span className="text-[10px] text-purple-200 font-medium">
                  {totalCount} {totalCount === 1 ? 'item' : 'items'}
                </span>
                <span className="font-extrabold text-xs sm:text-sm">
                  ₹{grandTotal}
                </span>
              </div>

              {totalCount > 0 && (
                <motion.span
                  key={totalCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 text-white font-black text-[10px] rounded-full flex items-center justify-center border-2 border-white shadow-sm"
                >
                  {totalCount}
                </motion.span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Address Selection Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
      />
    </>
  );
}
