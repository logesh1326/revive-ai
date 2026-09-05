import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, ArrowRight, Sparkles, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../store/AuthContext';

export default function CustomerProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateProfile } = useAuth();

  const verifiedPhone = location.state?.verifiedPhone || user?.phone || '+91 9876543210';
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!name.trim()) {
      errs.name = 'Please enter your full name.';
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim().toLowerCase(),
      });
      navigate('/address-setup');
    } catch (err) {
      console.error('Update profile error:', err);
      setErrors({ form: err.message || 'Could not save profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 via-white to-slate-50 flex flex-col justify-between items-center p-4 sm:p-6">
      
      {/* Top Header & Progress */}
      <div className="w-full max-w-md pt-4 sm:pt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white font-extrabold text-sm flex items-center justify-center">
              R
            </div>
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">
              REVIVE<span className="text-purple-600">AI</span>
            </span>
          </div>
          <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
            STEP 1 OF 2
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-6">
          <div className="w-1/2 h-full bg-purple-600 rounded-full"></div>
        </div>
      </div>

      {/* Profile Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 card-shadow border border-purple-50 my-auto shadow-xl"
      >
        <div className="mb-6">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Profile Setup</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Almost there! 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Tell us a little about yourself.
          </p>
        </div>

        {errors.form && (
          <div className="flex items-center gap-1.5 text-xs text-red-600 mb-4 p-3 bg-red-50 rounded-xl border border-red-100">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                }}
                placeholder="e.g. Rahul Sharma"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white transition-all"
                autoFocus
              />
            </div>
            {errors.name && (
              <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.name}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                }}
                placeholder="e.g. rahul@example.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white transition-all"
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.email}</p>
            )}
          </div>

          {/* Phone Number (Verified, Locked) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-extrabold text-slate-700">
                Phone Number
              </label>
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Phone verified</span>
              </div>
            </div>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
              <input
                type="tel"
                value={verifiedPhone}
                disabled
                className="w-full pl-10 pr-4 py-3 bg-slate-100/80 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-700 cursor-not-allowed select-none"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">
              Your verified mobile number is linked to your account.
            </p>
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 py-4 px-4 bg-purple-600 hover:bg-purple-700 active:scale-[0.99] disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving details...</span>
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Footer */}
      <div className="w-full max-w-md text-center py-4">
        <p className="text-[11px] text-slate-400 font-medium">
          Step 1 of 2 — Setting up your grocery profile
        </p>
      </div>
    </div>
  );
}
