import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, Mic, Camera, Sparkles, ChevronRight, ArrowRight, Zap, 
  RotateCcw, TrendingUp, ShieldCheck, Heart, Flame, Percent, ChefHat, Upload
} from 'lucide-react';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import ProductCard from '../components/ProductCard';
import { CATEGORIES, PRODUCTS, PROMO_HEROES, SMART_SAVINGS_PAIRS } from '../data/mockData';
import { useAuth } from '../store/AuthContext';
import { useCart } from '../store/CartContext';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, switchAndSave } = useCart();
  const [activePromoIndex, setActivePromoIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');
  const [smartSavingSwitched, setSmartSavingSwitched] = useState(false);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const dealProducts = PRODUCTS.filter((p) => p.isDeal);
  const popularProducts = PRODUCTS.filter((p) => p.isPopular);
  const buyAgainProducts = PRODUCTS.slice(0, 5);

  const filteredProducts = activeCategory === 'all' 
    ? PRODUCTS 
    : PRODUCTS.filter((p) => p.category === activeCategory);

  const handleAiPromptClick = (promptText) => {
    navigate('/ai-assistant', { state: { initialPrompt: promptText } });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] pb-24 md:pb-12 text-slate-900">
      
      {/* Sticky Top Navigation */}
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pt-3 space-y-6">

        {/* 1. Large Search Bar with Camera & Voice Scan */}
        <section className="relative">
          <div 
            onClick={() => navigate('/search')}
            className="flex items-center gap-3 w-full bg-white rounded-2xl px-4 py-3 border border-purple-100 card-shadow hover:border-purple-300 transition-all cursor-pointer group"
          >
            <Search className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
            <span className="flex-1 text-xs sm:text-sm font-semibold text-slate-400">
              Search for groceries, fruits, milk, snacks...
            </span>
            <div className="flex items-center gap-1.5 text-slate-400">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/menu-scanner');
                }}
                className="p-1.5 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-colors text-purple-600"
                title="Scan Menu / Recipe Image"
              >
                <Camera className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/search?voice=true');
                }}
                className="p-1.5 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-colors"
                title="Voice Search"
              >
                <Mic className="w-4 h-4 text-purple-600" />
              </button>
            </div>
          </div>
        </section>

        {/* 2. Personalized Greeting & Quick Stats */}
        <section className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{getGreeting()}, {user?.name?.split(' ')[0] || 'Rahul'}</span>
              <span className="text-xl">👋</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              What's on your grocery list today?
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-xs">
            <Zap className="w-4 h-4 fill-current text-emerald-600" />
            <span>15-20 Min Superfast Delivery</span>
          </div>
        </section>

        {/* 3. NEW: AI Handwritten Grocery List Scanner Hero Card */}
        <section className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-900 rounded-3xl p-6 text-white card-shadow relative overflow-hidden shadow-xl shadow-purple-900/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-bold text-3xl flex-shrink-0 shadow-inner">
                📝
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-lg sm:text-xl tracking-tight">
                    Scan My Grocery List
                  </h3>
                  <span className="bg-emerald-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full">
                    AI AGENT
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-purple-100 font-medium mt-1">
                  Upload a handwritten list and we'll build your cart.
                </p>
                <div className="flex items-center gap-3 mt-2 text-[11px] font-bold text-purple-200">
                  <span>✓ 100% Handwriting Support</span>
                  <span>•</span>
                  <span>✓ RL Personalization</span>
                  <span>•</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/ai-preferences');
                    }}
                    className="underline text-emerald-300 hover:text-emerald-200 cursor-pointer"
                  >
                    View AI Profile
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/scan-grocery-list')}
              className="px-6 py-3 bg-white text-purple-700 hover:bg-purple-50 active:scale-95 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <Camera className="w-4 h-4 text-purple-600" />
              <span>Scan List</span>
              <ArrowRight className="w-4 h-4 text-purple-600" />
            </button>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        </section>

        {/* 4. Promotional Hero Carousel */}
        <section className="relative overflow-hidden rounded-3xl">
          <div className="relative">
            <motion.div
              key={activePromoIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-purple-600/20"
            >
              {/* Background decorative circles */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 right-32 -mb-12 w-48 h-48 bg-purple-400/20 rounded-full blur-xl pointer-events-none" />

              <div className="relative z-10 max-w-md">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold text-purple-100 uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>{PROMO_HEROES[activePromoIndex].tag}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                  {PROMO_HEROES[activePromoIndex].title}
                </h3>
                <p className="text-xs sm:text-sm text-purple-100 font-medium mt-1.5">
                  {PROMO_HEROES[activePromoIndex].subtitle}
                </p>

                <div className="mt-5 flex items-center gap-3">
                  <button
                    onClick={() => navigate('/ai-assistant')}
                    className="px-5 py-2.5 bg-white text-purple-700 hover:bg-purple-50 font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <span>{PROMO_HEROES[activePromoIndex].cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-emerald-300 bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-400/30 backdrop-blur-xs">
                    {PROMO_HEROES[activePromoIndex].bgBadge}
                  </span>
                </div>
              </div>

              {/* Floating Hero Visual */}
              <div className="hidden sm:flex absolute right-6 bottom-4 items-center justify-center text-7xl opacity-90 drop-shadow-xl select-none">
                {PROMO_HEROES[activePromoIndex].icon}
              </div>
            </motion.div>

            {/* Carousel Dots */}
            <div className="flex justify-center gap-1.5 mt-3">
              {PROMO_HEROES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePromoIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    activePromoIndex === idx ? 'w-6 bg-purple-600' : 'w-2 bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 5. AI Shopping Assistant Card (Natural Integration) */}
        <section className="bg-gradient-to-br from-purple-50 via-white to-purple-50/40 rounded-3xl p-5 sm:p-6 border border-purple-100 card-shadow relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-600/25 flex-shrink-0">
                <Sparkles className="w-6 h-6 text-yellow-300 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                    ✨ Ask ReviveAI
                  </h3>
                  <span className="bg-purple-100 text-purple-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                    SMART ASSISTANT
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Plan meals, build weekly grocery baskets, or find the highest savings instantly.
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/ai-assistant')}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
            >
              <span>Open Assistant</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Prompt Suggestion Chips */}
          <div className="mt-4 pt-3.5 border-t border-purple-100/70 flex flex-wrap gap-2">
            {[
              'Build my weekly grocery list under ₹2000',
              'Find healthy snacks under ₹500',
              'What essentials should I buy this week?',
              'Find the cheapest option for Basmati Rice'
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleAiPromptClick(chip)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 text-xs font-bold border border-purple-100 hover:border-purple-300 transition-all shadow-2xs text-left"
              >
                💬 {chip}
              </button>
            ))}
          </div>
        </section>

        {/* 6. Horizontal Categories Scrolling */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
              Explore Categories
            </h3>
            <button
              onClick={() => navigate('/categories')}
              className="text-xs font-extrabold text-purple-600 hover:text-purple-700 flex items-center gap-0.5"
            >
              <span>See All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(isSelected ? 'all' : cat.id)}
                  className={`flex flex-col items-center flex-shrink-0 group transition-all p-2 rounded-2xl ${
                    isSelected ? 'bg-purple-100/80 scale-105' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-white p-1 card-shadow border border-slate-100 group-hover:border-purple-300 transition-all relative">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/5 rounded-xl" />
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-800 text-center mt-2 group-hover:text-purple-700 line-clamp-1 max-w-[72px]">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 7. AI Smart Savings Spotlight (Switch & Save Feature) */}
        <section className="bg-white rounded-3xl p-5 border border-emerald-100 card-shadow relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                ✨
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                AI Smart Savings Alert
              </h3>
            </div>
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              SAVE ₹121 INSTANTLY
            </span>
          </div>

          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 space-y-1">
              <p className="text-xs text-slate-500 font-semibold">
                You looked for: <span className="line-through text-slate-700 font-bold">{SMART_SAVINGS_PAIRS[0].currentProduct.name} (₹{SMART_SAVINGS_PAIRS[0].currentProduct.price})</span>
              </p>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-slate-900">
                  Better Alternative: {SMART_SAVINGS_PAIRS[0].betterDeal.name}
                </span>
                <span className="font-black text-sm text-emerald-600">
                  ₹{SMART_SAVINGS_PAIRS[0].betterDeal.price}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                💡 {SMART_SAVINGS_PAIRS[0].betterDeal.reason}
              </p>
            </div>

            <button
              onClick={() => {
                const deal = PRODUCTS.find((p) => p.id === 'prod_3') || PRODUCTS[2];
                addToCart(deal);
                setSmartSavingSwitched(true);
                setTimeout(() => setSmartSavingSwitched(false), 2000);
              }}
              disabled={smartSavingSwitched}
              className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                smartSavingSwitched
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white hover:scale-102'
              }`}
            >
              <span>{smartSavingSwitched ? '✓ Added to Cart!' : 'Switch & Save ₹121'}</span>
            </button>
          </div>
        </section>

        {/* 8. Today's Best Deals 🔥 (Horizontal Scroll) */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-none">
                  Today's Best Deals 🔥
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">Extra discounts updated every hour</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/search?filter=deals')}
              className="text-xs font-extrabold text-purple-600 hover:text-purple-700 flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {dealProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* 9. Smart Reorder — "Buy Again" */}
        <section className="bg-white rounded-3xl p-5 border border-purple-50 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <RotateCcw className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-none">
                  Buy Again
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">Your regular weekly essentials</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {buyAgainProducts.map((product) => (
              <div
                key={product.id}
                className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex flex-col justify-between"
              >
                <div className="aspect-square rounded-xl bg-white p-1 overflow-hidden mb-2">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{product.name}</h4>
                  <p className="text-[10px] text-slate-500">{product.quantity}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-extrabold text-xs text-slate-900">₹{product.price}</span>
                    <button
                      onClick={() => addToCart(product)}
                      className="px-2.5 py-1 bg-purple-600 text-white rounded-lg text-[10px] font-extrabold hover:bg-purple-700 transition-colors"
                    >
                      + Reorder
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 10. Recommended for You (Full Grid) */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-none">
                  Recommended for you
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">Curated for your kitchen</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
}
