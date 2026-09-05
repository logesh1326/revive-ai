import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Mic, X, Filter, ArrowLeft, Sparkles, SlidersHorizontal } from 'lucide-react';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import ProductCard from '../components/ProductCard';
import { PRODUCTS, CATEGORIES } from '../data/mockData';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';
  const isVoiceActive = searchParams.get('voice') === 'true';

  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isListening, setIsListening] = useState(isVoiceActive);

  useEffect(() => {
    if (isVoiceActive) {
      const timer = setTimeout(() => {
        setQuery('milk');
        setIsListening(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isVoiceActive]);

  const recentSearches = ['Amul Milk', 'Basmati Rice', 'Tomatoes', 'Bread', 'Sunflower Oil'];
  const popularSearches = ['Atta 5kg', 'Eggs', 'Curd', 'Onions', 'Maggie Noodles', 'Tea'];

  // Filtering Logic
  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesQuery = query.trim() === '' || 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.brand.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase());

    if (!matchesQuery) return false;

    if (activeFilter === 'under100') return product.price <= 100;
    if (activeFilter === 'deals') return product.isDeal || Boolean(product.discount);
    if (activeFilter === 'fast') return product.deliveryTime && product.deliveryTime.includes('15');

    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAFAFC] pb-24 md:pb-12 text-slate-900">
      
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pt-3 space-y-4">
        
        {/* Search Header Input */}
        <div className="relative flex items-center gap-2">
          <button
            onClick={() => navigate('/home')}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 flex items-center gap-2 bg-white rounded-2xl px-3.5 py-2.5 border border-purple-200 focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-100 card-shadow transition-all">
            <SearchIcon className="w-5 h-5 text-purple-600" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for milk, atta, vegetables, snacks..."
              className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-transparent focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setIsListening(true)}
              className={`p-1.5 rounded-xl transition-colors ${
                isListening ? 'bg-purple-600 text-white animate-pulse' : 'text-purple-600 hover:bg-purple-50'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Voice Listening Modal / Banner */}
        {isListening && (
          <div className="p-4 rounded-2xl bg-purple-600 text-white flex items-center justify-between shadow-lg shadow-purple-600/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center animate-ping">
                <Mic className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-sm block">Listening for items...</span>
                <span className="text-[11px] text-purple-200">Say something like "Fresh Milk and Bread"</span>
              </div>
            </div>
            <button
              onClick={() => setIsListening(false)}
              className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl font-bold"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'deals', label: '🔥 Best Deals' },
            { id: 'under100', label: '💰 Under ₹100' },
            { id: 'fast', label: '⚡ 15-Min Delivery' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeFilter === f.id
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-purple-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Suggestions (When query is empty) */}
        {!query && (
          <div className="space-y-4 pt-2">
            <div>
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                Recent Searches
              </span>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(item)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:border-purple-400 hover:bg-purple-50 transition-colors"
                  >
                    🕒 {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                Trending in Chennai
              </span>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(item)}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-100 text-purple-800 text-xs font-bold hover:bg-purple-100 transition-colors"
                  >
                    🔥 {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search Results Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-slate-500">
              Showing {filteredProducts.length} items
            </span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl p-6 border border-purple-50 card-shadow">
              <span className="text-4xl block mb-2">🔍</span>
              <h3 className="font-extrabold text-slate-900 text-base">No matching products found</h3>
              <p className="text-xs text-slate-500 mt-1">
                Try searching with a different keyword or ask ReviveAI Assistant to build a list.
              </p>
              <button
                onClick={() => navigate('/ai-assistant')}
                className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20"
              >
                ✨ Ask ReviveAI
              </button>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
