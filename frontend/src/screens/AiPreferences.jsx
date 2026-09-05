import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Brain, Sparkles, Heart, CheckCircle2, 
  RotateCcw, Trash2, Cpu, BarChart3, ShoppingBag, ShieldCheck 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import AiInsightsModal from '../components/AiInsightsModal';
import { api } from '../api/client';
import { useAuth } from '../store/AuthContext';

export default function AiPreferences() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [preferences, setPreferences] = useState(null);
  const [showInsightsModal, setShowInsightsModal] = useState(false);

  useEffect(() => {
    api.getAiPreferences(user?.id)
      .then((res) => {
        if (res.preferences) setPreferences(res.preferences);
      })
      .catch((err) => console.warn('Could not load preferences:', err));
  }, [user]);

  return (
    <div className="min-h-screen bg-[#FAFAFC] pb-24 md:pb-12 text-slate-900">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 pt-4 space-y-6">
        {/* Back Link & Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          <button
            onClick={() => setShowInsightsModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-full border border-purple-200 transition-all cursor-pointer shadow-xs"
          >
            <Cpu className="w-3.5 h-3.5 text-purple-600" />
            <span>Developer AI Insights</span>
          </button>
        </div>

        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-950 text-white shadow-xl relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-purple-200 border border-white/15 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Personalized Smart Grocery Agent</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Your AI Shopping Profile
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 font-medium mt-1.5 max-w-md">
              ReviveAI continually learns from your grocery list scans, brand selections, and purchases to build your ideal cart in seconds.
            </p>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] w-48 h-48 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
        </motion.div>

        {/* 1. Shopping Patterns */}
        <div className="p-6 rounded-3xl bg-white border border-slate-100 card-shadow space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-purple-600" />
              <span>Your Shopping Patterns</span>
            </h2>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Active Learning
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
              <span className="text-[11px] font-bold text-purple-700 block mb-1">Frequently Bought</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {['Milk', 'Eggs', 'Potatoes', 'Bread', 'Atta'].map((item, idx) => (
                  <span key={idx} className="text-xs font-extrabold bg-white text-purple-900 px-2 py-0.5 rounded-lg border border-purple-200/60">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-600 block mb-1">Preferred Brands</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {['Amul', 'Safal', 'Almond Breeze', 'Barilla', 'Freshwrap'].map((b, idx) => (
                  <span key={idx} className="text-xs font-bold bg-white text-slate-800 px-2 py-0.5 rounded-lg border border-slate-200">
                    {b}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-600 block mb-1">Typical Basket</span>
              <p className="text-base font-black text-slate-900 mt-1">₹800 – ₹1,600</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Average savings ₹120/order</p>
            </div>
          </div>
        </div>

        {/* 2. Recommendation Accuracy Metrics */}
        <div className="p-6 rounded-3xl bg-white border border-slate-100 card-shadow space-y-4">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600" />
              <span>AI Learning Accuracy</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              How often ReviveAI's smart list predictions match your exact preferences.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center pt-2">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-emerald-950">78%</p>
              <p className="text-[11px] font-bold text-emerald-700 mt-0.5">Accepted Directly</p>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
              <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                <RotateCcw className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-blue-950">14%</p>
              <p className="text-[11px] font-bold text-blue-700 mt-0.5">Replaced with Alt</p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
              <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
                <Trash2 className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-amber-950">8%</p>
              <p className="text-[11px] font-bold text-amber-700 mt-0.5">Removed</p>
            </div>
          </div>
        </div>

        {/* Privacy & Safety Guarantee */}
        <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0" />
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            <span className="font-bold text-slate-900">100% Confirmation Safety:</span> ReviveAI only suggests products and builds draft carts. Orders and payments are never initiated without your explicit confirmation.
          </p>
        </div>
      </main>

      <BottomNav />

      {/* Developer Insights Modal */}
      <AiInsightsModal
        isOpen={showInsightsModal}
        onClose={() => setShowInsightsModal(false)}
      />
    </div>
  );
}
