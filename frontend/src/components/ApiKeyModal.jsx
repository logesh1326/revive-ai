import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, ShieldCheck, Check, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose }) {
  const [razorpayKey, setRazorpayKey] = useState(() => {
    return localStorage.getItem('revive_razorpay_key') || 'rzp_test_1DP5mmOlF5G5ag';
  });

  const [geminiKey, setGeminiKey] = useState(() => {
    return localStorage.getItem('revive_gemini_key') || '';
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRazorpayKey(localStorage.getItem('revive_razorpay_key') || 'rzp_test_1DP5mmOlF5G5ag');
      setGeminiKey(localStorage.getItem('revive_gemini_key') || '');
    }
  }, [isOpen]);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('revive_razorpay_key', razorpayKey.trim());
    if (geminiKey.trim()) {
      localStorage.setItem('revive_gemini_key', geminiKey.trim());
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-purple-100 overflow-hidden relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">API & Payment Keys</h3>
                <p className="text-xs text-slate-500">Configure Razorpay & AI Integrations</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="py-4 space-y-4">
            
            {/* Razorpay Key ID */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-black text-slate-800">
                  Razorpay Key ID
                </label>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                  Test / Live Key
                </span>
              </div>
              <input
                type="text"
                value={razorpayKey}
                onChange={(e) => setRazorpayKey(e.target.value)}
                placeholder="rzp_test_... or rzp_live_..."
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-2xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 focus:outline-none font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Used to initialize Razorpay Popup Checkout and generate dynamic UPI QR payloads.
              </p>
            </div>

            {/* Gemini API Key */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-black text-slate-800">
                  Google Gemini API Key (Optional)
                </label>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  AI Vision
                </span>
              </div>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-2xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 focus:outline-none font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Used for live LLM recipe parsing and handwriting OCR.
              </p>
            </div>

            {/* Test Credentials Reminder */}
            <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-[11px] text-purple-900 font-medium flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <span>
                Default test key is pre-configured. You can simulate instant QR code scans or trigger the Razorpay gateway modal.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/25 flex items-center justify-center gap-1.5"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Keys Saved!</span>
                  </>
                ) : (
                  <span>Save Settings</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
