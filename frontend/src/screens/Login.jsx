import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, ArrowRight, ShieldCheck, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../api/client';

export default function Login() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    const cleanNumber = phoneNumber.replace(/\D/g, '');

    if (cleanNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const fullPhone = `+91${cleanNumber}`;
      const response = await api.sendOtp(fullPhone);

      // Navigate to /verify-phone screen with state
      navigate('/verify-phone', {
        state: {
          phone: fullPhone,
          rawPhone: cleanNumber,
          verification_id: response.verification_id,
          isReal: response.isReal,
          provider: response.provider,
          dev_code: response.dev_code,
          dev_notice: response.dev_notice,
        },
      });
    } catch (err) {
      console.error('Send OTP failed:', err);
      setError(err.message || "We couldn't send the code right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/70 via-white to-slate-50 flex flex-col justify-between items-center p-4 sm:p-6">
      
      {/* Top Header */}
      <div className="w-full max-w-md pt-4 sm:pt-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-purple-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-purple-600/20">
            R
          </div>
          <span className="font-black text-xl text-slate-900 tracking-tight">
            REVIVE<span className="text-purple-600">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/70">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>Smart Grocery</span>
        </div>
      </div>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 card-shadow border border-purple-50 my-auto shadow-xl"
      >
        <div className="text-center mb-7">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome to ReviveAI
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1.5">
            Enter your mobile number to continue
          </p>
        </div>

        {/* Phone Input Form */}
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
              Mobile Number
            </label>
            <div className="flex rounded-2xl border border-slate-200 focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-100 overflow-hidden bg-slate-50/50 transition-all">
              <div className="px-3.5 py-3.5 bg-slate-100 border-r border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
                <span className="text-base">🇮🇳</span>
                <span>+91</span>
              </div>
              <input
                type="tel"
                maxLength="10"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                placeholder="Enter mobile number"
                className="w-full px-3.5 py-3.5 text-sm font-semibold text-slate-900 bg-transparent focus:outline-none"
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-[11px] text-red-600 mt-2 font-semibold bg-red-50 p-2.5 rounded-xl border border-red-100">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || phoneNumber.length < 10}
            className="w-full py-4 px-4 bg-purple-600 hover:bg-purple-700 active:scale-[0.99] disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending OTP...</span>
              </>
            ) : (
              <>
                <span>Send OTP</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-center text-slate-400 font-medium mt-4">
          We'll send a verification code to your mobile number.
        </p>

        {/* Benefits Guarantee */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Zero spam • 100% Safe & Secure Login</span>
        </div>
      </motion.div>

      {/* Footer Terms */}
      <div className="max-w-xs text-center py-4">
        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
          By continuing, you agree to ReviveAI's{' '}
          <span className="text-slate-600 font-semibold underline cursor-pointer">Terms of Service</span> &{' '}
          <span className="text-slate-600 font-semibold underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
