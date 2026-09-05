import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, Search, Sparkles, ShoppingBag, User, ChefHat } from 'lucide-react';
import { useCart } from '../store/CartContext';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const { totalCount } = useCart();

  const navItems = [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/scan-grocery-list', icon: ChefHat, label: 'Scan List' },
    { to: '/ai-assistant', icon: Sparkles, label: 'ReviveAI', highlight: true },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/cart', icon: ShoppingBag, label: 'Cart', badge: totalCount },
    { to: '/profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] px-2 py-1.5 safe-area-pb">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-1.5 rounded-xl relative transition-all duration-200 ${
                  isActive ? 'text-purple-700 font-bold' : 'text-slate-500 hover:text-slate-900 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.highlight ? (
                    <div className="relative -top-2 flex flex-col items-center">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-700 via-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 border-2 border-white"
                      >
                        <Sparkles className="w-5 h-5 text-yellow-300" />
                      </motion.div>
                      <span className="text-[10px] font-extrabold text-purple-700 mt-0.5">
                        {item.label}
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="relative">
                        <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-purple-600' : ''}`} />
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className={`text-[9px] sm:text-[10px] mt-1 ${isActive ? 'font-extrabold text-purple-700' : 'text-slate-500'}`}>
                        {item.label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="bottomNavDot"
                          className="w-1 h-1 bg-purple-600 rounded-full mt-0.5"
                        />
                      )}
                    </>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
