import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Brain, Sparkles, TrendingUp, Cpu, Compass, 
  CheckCircle2, RefreshCw, BarChart3, Award 
} from 'lucide-react';
import { api } from '../api/client';

export default function AiInsightsModal({ isOpen, onClose }) {
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAiInsights();
      if (res.insights) {
        setInsights(res.insights);
      }
    } catch (e) {
      console.warn('Failed to load AI insights:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchInsights();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-purple-100 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md shadow-purple-600/20">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-slate-900 text-base">AI Model & RL Insights</h3>
                <span className="text-[10px] font-black uppercase bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Contextual Bandit & Customer Personalization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Model Stats Cards */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100">
            <div className="flex items-center gap-1.5 text-purple-700 text-xs font-bold mb-1">
              <Cpu className="w-3.5 h-3.5" />
              <span>Policy Model</span>
            </div>
            <p className="text-sm font-black text-purple-950">
              {insights?.model || 'Contextual Bandit'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Epsilon-Greedy</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Exploration</span>
            </div>
            <p className="text-sm font-black text-emerald-950">
              {insights?.exploration_rate || '10%'} <span className="text-xs text-emerald-600 font-bold">/ 90% Exploit</span>
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Bounded Exploration</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100">
            <div className="flex items-center gap-1.5 text-blue-700 text-xs font-bold mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Acceptance Rate</span>
            </div>
            <p className="text-sm font-black text-blue-950">
              {insights?.acceptance_rate || '78%'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
              {insights?.recommendations_accepted || 1108} / {insights?.recommendations_served || 1420} recommendations
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100">
            <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Cumulative Reward</span>
            </div>
            <p className="text-sm font-black text-amber-950">
              {insights?.total_model_reward || '+1,847'}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Feedback reward sum</p>
          </div>
        </div>

        {/* Top Learned Preferences */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Top Learned Preferences (RL Agent)</span>
          </div>
          <ul className="space-y-2">
            {(insights?.top_learned_preferences || [
              'Customer prefers familiar brands when price variance is below 12%',
              'High conversion on organic & farm fresh produce when in stock',
              'Prefers larger pack sizes (1L / 1kg) for dairy & staples',
            ]).map((pref, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                <span>{pref}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Reinforcement Learning Reward Matrix Reference */}
        <div className="p-3 bg-purple-50/40 rounded-xl border border-purple-100 text-[11px] text-slate-600 space-y-1">
          <div className="font-bold text-purple-900 mb-1">Reward Signal Function:</div>
          <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
            <div><span className="text-emerald-700 font-bold">+2.0</span> Order Purchase</div>
            <div><span className="text-emerald-600 font-bold">+1.0</span> Add to Cart</div>
            <div><span className="text-blue-600 font-bold">+0.5</span> View Details</div>
            <div><span className="text-slate-400 font-bold"> 0.0</span> Ignore Pick</div>
            <div><span className="text-amber-600 font-bold">-1.0</span> Remove from Cart</div>
            <div><span className="text-red-600 font-bold">-2.0</span> Replace with Alt</div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer"
          >
            Close Insights
          </button>
        </div>
      </motion.div>
    </div>
  );
}
