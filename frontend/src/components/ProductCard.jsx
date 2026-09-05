import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Star, Clock, Zap } from 'lucide-react';
import { useCart } from '../store/CartContext';

export default function ProductCard({ product, onSelect }) {
  const { getItemQuantity, addToCart, updateQuantity } = useCart();
  const quantity = getItemQuantity(product.id);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl p-3 border border-slate-100 hover:border-purple-200 card-shadow card-shadow-hover transition-all flex flex-col justify-between relative group"
    >
      {/* Top Badges */}
      <div className="flex items-center justify-between gap-1 mb-2">
        {product.discount ? (
          <span className="bg-emerald-50 text-emerald-700 font-extrabold text-[10px] px-2 py-0.5 rounded-md border border-emerald-200/60">
            {product.discount}
          </span>
        ) : product.badge ? (
          <span className="bg-purple-50 text-purple-700 font-bold text-[10px] px-2 py-0.5 rounded-md border border-purple-200/60">
            {product.badge}
          </span>
        ) : <div />}

        <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded-md">
          <Clock className="w-3 h-3 text-purple-500" />
          <span>{product.deliveryTime || '15-20 min'}</span>
        </div>
      </div>

      {/* Product Image */}
      <div 
        onClick={() => onSelect && onSelect(product)}
        className="relative aspect-square w-full rounded-xl bg-gradient-to-b from-slate-50 to-purple-50/20 overflow-hidden mb-2.5 flex items-center justify-center cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80';
          }}
        />
        {product.isDeal && (
          <div className="absolute bottom-1.5 left-1.5 bg-amber-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm flex items-center gap-0.5 shadow-xs">
            <Zap className="w-2.5 h-2.5 fill-current" /> DEAL
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold mb-0.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{product.rating || '4.6'}</span>
            {product.ratingCount && (
              <span className="text-slate-400 font-normal">({product.ratingCount})</span>
            )}
          </div>

          <h4
            onClick={() => onSelect && onSelect(product)}
            className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-tight hover:text-purple-700 transition-colors cursor-pointer"
            title={product.name}
          >
            {product.name}
          </h4>

          <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
            {product.quantity}
          </p>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="mt-3 pt-2 border-t border-slate-50 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-extrabold text-slate-900">
                ₹{product.price}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[11px] text-slate-400 line-through font-medium">
                  ₹{product.originalPrice}
                </span>
              )}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[9px] font-bold text-emerald-600 -mt-0.5">
                Save ₹{product.originalPrice - product.price}
              </span>
            )}
          </div>

          {/* Action Button */}
          {quantity === 0 ? (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => addToCart(product)}
              className="px-3 sm:px-4 py-1.5 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white border border-purple-200 hover:border-purple-600 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1 shadow-xs hover:shadow-purple-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD</span>
            </motion.button>
          ) : (
            <div className="flex items-center bg-purple-600 text-white rounded-xl shadow-sm overflow-hidden p-0.5">
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => updateQuantity(product.id, -1)}
                className="w-6 h-6 flex items-center justify-center hover:bg-purple-700 rounded-lg transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </motion.button>
              <span className="w-6 text-center text-xs font-black">
                {quantity}
              </span>
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => updateQuantity(product.id, 1)}
                className="w-6 h-6 flex items-center justify-center hover:bg-purple-700 rounded-lg transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
