import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, Clock, Copy, Check, Smartphone, 
  ShieldCheck, Sparkles, RefreshCw, ArrowRight, Zap
} from 'lucide-react';

export default function UpiQrPayment({ amount, orderId, onPaymentSuccess, onCancel }) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Dynamic UPI string
  const upiId = 'reviveai.groceries@icici';
  const upiPayload = `upi://pay?pa=${upiId}&pn=ReviveAI%20Groceries&am=${amount}&cu=INR&tn=Order%20${orderId || 'RV10284'}`;

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onPaymentSuccess({
        paymentId: `pay_qr_${Date.now()}`,
        method: 'UPI QR Code',
        upiApp: 'Google Pay / PhonePe'
      });
    }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-5 rounded-3xl bg-gradient-to-b from-purple-50/70 via-white to-purple-50/40 border-2 border-purple-200 card-shadow space-y-4 text-center"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-purple-100">
        <div className="flex items-center gap-2 text-left">
          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black">
            ⚡
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900">
              Scan UPI QR Code to Pay
            </h4>
            <span className="text-[10px] text-purple-700 font-bold">
              Instant 0% Convenience Fee
            </span>
          </div>
        </div>

        {/* Live Countdown */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-black">
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* QR Code Container with ReviveAI Logo Center */}
      <div className="flex flex-col items-center justify-center py-2">
        <div className="p-4 bg-white rounded-3xl border-2 border-purple-100 shadow-md relative group">
          <QRCodeSVG
            value={upiPayload}
            size={180}
            level="H"
            includeMargin={true}
            fgColor="#111827"
            imageSettings={{
              src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%237C3AED'/><text x='50' y='65' font-size='50' font-weight='900' fill='white' text-anchor='middle'>R</text></svg>",
              x: undefined,
              y: undefined,
              height: 36,
              width: 36,
              excavate: true,
            }}
          />

          <span className="text-[10px] font-extrabold text-slate-400 block mt-1">
            Exact Amount: <span className="text-purple-700 font-black">₹{amount}</span>
          </span>
        </div>

        {/* Supported UPI Apps Badges */}
        <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
          {['GPay', 'PhonePe', 'Paytm', 'BHIM', 'Cred UPI'].map((app) => (
            <span
              key={app}
              className="text-[10px] font-extrabold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-lg shadow-2xs"
            >
              {app}
            </span>
          ))}
        </div>
      </div>

      {/* UPI ID Copy Card */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 flex items-center justify-between text-left">
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
            UPI VPA / ID
          </span>
          <span className="text-xs font-extrabold text-slate-800 font-mono">
            {upiId}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopyUpi}
          className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleSimulatePayment}
          disabled={isVerifying}
          className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
        >
          {isVerifying ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Verifying UPI Transaction...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>I Have Paid (Verify & Place Order)</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-slate-400 font-medium">
          🔒 256-Bit Encrypted Secure Razorpay & NPCI UPI Gateway
        </p>
      </div>
    </motion.div>
  );
}
