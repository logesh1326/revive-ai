import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, ArrowRight, ShieldCheck, Sparkles, Loader2, 
  RefreshCw, AlertCircle, MessageSquare, Copy, Check, CheckCircle2 
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../store/AuthContext';

export default function VerifyPhone() {
  const location = useLocation();
  const navigate = useNavigate();
  const { handleLoginSuccess } = useAuth();

  const phone = location.state?.phone || '+919876543210';
  const initialVerificationId = location.state?.verification_id || '';
  const initialDevCode = location.state?.dev_code || null;
  const initialDevNotice = location.state?.dev_notice || null;

  const [verificationId, setVerificationId] = useState(initialVerificationId);
  const [devCode, setDevCode] = useState(initialDevCode);
  const [devNotice, setDevNotice] = useState(initialDevNotice);
  
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [copied, setCopied] = useState(false);

  const inputRefs = useRef([]);

  // Mask phone number: e.g. +91 ******3210
  const maskedPhone = React.useMemo(() => {
    const raw = phone.replace(/^\+91/, '').replace(/^\+/, '');
    if (raw.length >= 10) {
      const start = raw.slice(0, 2);
      const end = raw.slice(-4);
      return `+91 ${start}****${end}`;
    }
    return phone;
  }, [phone]);

  // Countdown timer
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Handle single digit input
  const handleOtpChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, '');
    const newOtp = [...otpDigits];

    if (cleanVal.length > 1) {
      // Pasted content in single input
      const chars = cleanVal.slice(0, 6).split('');
      chars.forEach((c, i) => {
        if (i < 6) newOtp[i] = c;
      });
      setOtpDigits(newOtp);
      const nextIdx = Math.min(chars.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    newOtp[index] = cleanVal;
    setOtpDigits(newOtp);
    setError('');

    // Auto-focus next input
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Auto-fill code helper
  const handleAutoFill = (code) => {
    if (!code) return;
    const digits = code.toString().split('').slice(0, 6);
    setOtpDigits(digits);
    if (inputRefs.current[5]) {
      inputRefs.current[5].focus();
    }
  };

  // Handle Resend OTP
  const handleResend = async () => {
    if (!canResend || isResending) return;
    setError('');
    setIsResending(true);

    try {
      const res = await api.sendOtp(phone);
      setVerificationId(res.verification_id);
      if (res.dev_code) setDevCode(res.dev_code);
      if (res.dev_notice) setDevNotice(res.dev_notice);

      setOtpDigits(['', '', '', '', '', '']);
      setTimer(30);
      setCanResend(false);
      setSuccessMsg('A new verification code has been sent.');
      setTimeout(() => setSuccessMsg(''), 4000);

      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (err) {
      setError(err.message || "We couldn't send the code right now. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // Verify OTP submission
  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join('');

    if (fullOtp.length < 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await api.verifyOtp(phone, fullOtp, verificationId);

      // Save user session in AuthContext
      handleLoginSuccess(res.user, res.token);

      if (res.is_new_user) {
        // New User Flow: Setup profile
        navigate('/profile-setup', {
          state: {
            verifiedPhone: res.user.phone,
          },
        });
      } else {
        // Existing User Flow: Enter grocery app directly
        navigate('/home');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err.message || "That code isn't correct. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/70 via-white to-slate-50 flex flex-col justify-between items-center p-4 sm:p-6 relative overflow-x-hidden">
      
      {/* Dev / Prototype Notice Toast */}
      <AnimatePresence>
        {(devCode || devNotice || successMsg) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md mb-2 z-20"
          >
            <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400">
                    {devCode ? 'Dev Mode (SMS Provider Unconfigured)' : 'SMS Notice'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Just now</span>
                </div>
                <p className="text-xs font-semibold text-slate-200 mt-1 leading-snug">
                  {devCode 
                    ? `Verification code: ${devCode} (Configure Twilio in .env for live SMS)`
                    : successMsg || `SMS sent to ${maskedPhone}. Please check your phone.`}
                </p>

                {devCode && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAutoFill(devCode)}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 active:scale-95 text-white text-xs font-extrabold rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Auto-fill {devCode}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(devCode);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="w-full max-w-md pt-4 sm:pt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors p-1 -ml-1 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Change Number</span>
        </button>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/70">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          <span>ReviveAI</span>
        </div>
      </div>

      {/* Main Verification Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 card-shadow border border-purple-50 my-auto shadow-xl"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Verify your number
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1.5">
            Enter the 6-digit code sent to
          </p>
          <p className="text-sm font-black text-purple-700 mt-1">
            {maskedPhone}
          </p>
        </div>

        {/* 6-digit OTP Inputs */}
        <form onSubmit={handleVerify} className="space-y-5">
          <div className="flex justify-center gap-2 sm:gap-2.5 my-4">
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onFocus={(e) => e.target.select()}
                className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black rounded-2xl border-2 transition-all outline-none ${
                  digit
                    ? 'border-purple-600 bg-purple-50/40 text-purple-900 shadow-sm'
                    : 'border-slate-200 bg-slate-50/50 text-slate-900 focus:border-purple-500 focus:bg-white'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-red-600 font-semibold bg-red-50 p-2.5 rounded-xl border border-red-100">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || otpDigits.join('').length < 6}
            className="w-full py-4 px-4 bg-purple-600 hover:bg-purple-700 active:scale-[0.99] disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying code...</span>
              </>
            ) : (
              <>
                <span>Verify OTP</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Resend OTP */}
          <div className="text-center pt-2 flex items-center justify-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Didn't receive the code?</span>
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer transition-colors"
              >
                {isResending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                <span>Resend OTP</span>
              </button>
            ) : (
              <span className="font-bold text-slate-400">
                Resend in <span className="text-purple-600 font-black">{timer}s</span>
              </span>
            )}
          </div>
        </form>

        {/* Benefits Guarantee */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Zero spam • 100% Safe & Secure Login</span>
        </div>
      </motion.div>

      {/* Footer */}
      <div className="max-w-xs text-center py-4">
        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
          Secure phone authentication powered by ReviveAI.
        </p>
      </div>
    </div>
  );
}
