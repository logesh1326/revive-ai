import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import ProductCard from '../components/ProductCard';
import { CATEGORIES, PRODUCTS } from '../data/mockData';

export default function CategoryPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(id || CATEGORIES[0].id);

  const activeCatObj = CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0];
  const categoryProducts = PRODUCTS.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#FAFAFC] pb-24 md:pb-12 text-slate-900">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 pt-3 space-y-4">
        {/* Category Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/home')}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{activeCatObj.icon}</span>
              <span>{activeCatObj.name}</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">{activeCatObj.itemCount}</p>
          </div>
        </div>

        {/* Categories Sidebar/Tabs Horizontal */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-2xl font-extrabold text-xs flex items-center gap-1.5 flex-shrink-0 transition-all ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20 scale-105'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-purple-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Products in selected category */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">
              Showing {categoryProducts.length} items in {activeCatObj.name}
            </span>
          </div>

          {categoryProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl p-6 border border-purple-50 card-shadow">
              <span className="text-4xl block mb-2">{activeCatObj.icon}</span>
              <h3 className="font-extrabold text-slate-900 text-base">Fresh stock arriving soon</h3>
              <p className="text-xs text-slate-500 mt-1">
                More {activeCatObj.name} items are being packed in your local hub.
              </p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
