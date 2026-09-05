import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Clock, CreditCard, ShieldCheck, 
  Check, ChevronRight, Sparkles, Smartphone, Wallet, Banknote, 
  ArrowRight, Key, QrCode, RefreshCw, AlertCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import { useOrder } from '../store/OrderContext';
import UpiQrPayment from '../components/UpiQrPayment';
import ApiKeyModal from '../components/ApiKeyModal';

export default function Checkout() {
  const navigate = useNavigate();
  const { currentAddress, user } = useAuth();
  const { items, subtotal, grandTotal, totalSavings, clearCart } = useCart();
  const { placeOrder } = useOrder();

  const [paymentMethod, setPaymentMethod] = useState('UPI_QR'); // 'UPI_QR' | 'RAZORPAY' | 'UPI_APP' | 'Card' | 'COD'
  const [upiApp, setUpiApp] = useState('gpay');
  const [deliverySlot, setDeliverySlot] = useState('express');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Trigger Razorpay Standard Popup Checkout
  const handleRazorpayStandardCheckout = () => {
    setIsProcessing(true);
    const razorpayKey = localStorage.getItem('revive_razorpay_key') || 'rzp_test_1DP5mmOlF5G5ag';

    if (typeof window.Razorpay === 'undefined') {
      // Fallback if Razorpay SDK script not ready
      setTimeout(() => {
        completeOrderSuccess(`pay_mock_${Date.now()}`, 'Razorpay Standard');
      }, 1000);
      return;
    }

    const options = {
      key: razorpayKey,
      amount: Math.round(grandTotal * 100), // in paise
      currency: 'INR',
      name: 'REVIVEAI Groceries',
      description: `Delivery to ${currentAddress?.area || 'Chennai'}`,
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80",
      handler: function (response) {
        setIsProcessing(false);
        completeOrderSuccess(response.razorpay_payment_id || `pay_${Date.now()}`, 'Razorpay Online');
      },
      prefill: {
        name: user?.name || 'Rahul Sharma',
        email: user?.email || 'rahul.sharma@gmail.com',
        contact: user?.phone?.replace(/\D/g, '') || '9876543210'
      },
      theme: {
        color: '#7C3AED'
      },
      modal: {
        ondismiss: function () {
          setIsProcessing(false);
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        setIsProcessing(false);
        alert(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (err) {
      console.warn('Razorpay open failed, using fallback:', err);
      setTimeout(() => {
        completeOrderSuccess(`pay_test_${Date.now()}`, 'Razorpay Gateway');
      }, 1000);
    }
  };

  const completeOrderSuccess = (paymentId, method) => {
    const order = placeOrder({
      items,
      subtotal,
      grandTotal,
      totalSavings,
      address: currentAddress,
      paymentMethod: method || paymentMethod
    });
    clearCart();
    setIsProcessing(false);
    navigate('/order-success', { state: { orderId: order.id } });
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === 'RAZORPAY') {
      handleRazorpayStandardCheckout();
      return;
    }

    if (paymentMethod === 'UPI_QR') {
      // Handled directly inside UpiQrPayment component or fallback
      setIsProcessing(true);
      setTimeout(() => {
        completeOrderSuccess(`pay_qr_${Date.now()}`, 'UPI QR Code');
      }, 1000);
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      completeOrderSuccess(
        `pay_${Date.now()}`,
        paymentMethod === 'UPI_APP' ? `UPI (${upiApp.toUpperCase()})` : paymentMethod
      );
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] pb-28 md:pb-12 text-slate-900">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 pt-3 space-y-4">
        
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/cart')}
              className="p-2 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Checkout & Pay</h1>
              <p className="text-xs text-slate-500">Fast 15-min delivery with Razorpay & UPI QR</p>
            </div>
          </div>

          {/* API Keys Configuration Button */}
          <button
            onClick={() => setIsApiKeyModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-all border border-purple-200 flex items-center gap-1.5 shadow-2xs"
          >
            <Key className="w-3.5 h-3.5 text-purple-600" />
            <span>API & Keys</span>
          </button>
        </div>

        {/* STEP 1: Delivery Address */}
        <div className="bg-white rounded-3xl p-5 border border-purple-50 card-shadow space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="font-extrabold text-sm text-slate-900">Delivery Address</h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              ⚡ 15–20 MIN
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-purple-600 text-white mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-slate-900">
                  {currentAddress?.type || 'Home'} — {user?.name}
                </span>
                <span className="text-xs font-bold text-purple-700">{user?.phone}</span>
              </div>
              <p className="text-xs font-semibold text-slate-700 mt-1">{currentAddress?.building}</p>
              <p className="text-[11px] text-slate-500">{currentAddress?.area}, {currentAddress?.city} - {currentAddress?.pincode}</p>
            </div>
          </div>
        </div>

        {/* STEP 2: Delivery Speed */}
        <div className="bg-white rounded-3xl p-5 border border-purple-50 card-shadow space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center">
              2
            </span>
            <h3 className="font-extrabold text-sm text-slate-900">Delivery Speed</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => setDeliverySlot('express')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                deliverySlot === 'express'
                  ? 'border-purple-600 bg-purple-50/60 shadow-xs'
                  : 'border-slate-200 hover:border-purple-200'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                ⚡
              </div>
              <div className="flex-1">
                <span className="block font-extrabold text-xs text-slate-900">Express Delivery</span>
                <span className="block text-[11px] text-purple-700 font-semibold">Arriving in 15–20 mins</span>
              </div>
              {deliverySlot === 'express' && <Check className="w-4 h-4 text-purple-600" />}
            </div>

            <div
              onClick={() => setDeliverySlot('standard')}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                deliverySlot === 'standard'
                  ? 'border-purple-600 bg-purple-50/60 shadow-xs'
                  : 'border-slate-200 hover:border-purple-200'
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                🕒
              </div>
              <div className="flex-1">
                <span className="block font-extrabold text-xs text-slate-900">Standard Slot</span>
                <span className="block text-[11px] text-slate-500 font-semibold">Today evening (6 - 8 PM)</span>
              </div>
              {deliverySlot === 'standard' && <Check className="w-4 h-4 text-purple-600" />}
            </div>
          </div>
        </div>

        {/* STEP 3: Payment Method Selector */}
        <div className="bg-white rounded-3xl p-5 border border-purple-50 card-shadow space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center">
                3
              </span>
              <h3 className="font-extrabold text-sm text-slate-900">Payment Option</h3>
            </div>
            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              RAZORPAY SECURED
            </span>
          </div>

          <div className="space-y-3">
            
            {/* 1. UPI QR Code Option (Featured) */}
            <div
              onClick={() => setPaymentMethod('UPI_QR')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                paymentMethod === 'UPI_QR'
                  ? 'border-purple-600 bg-purple-50/40 shadow-xs'
                  : 'border-slate-200 hover:border-purple-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs sm:text-sm text-slate-900">
                        Scan UPI QR Code
                      </span>
                      <span className="bg-purple-100 text-purple-700 font-extrabold text-[9px] px-2 py-0.5 rounded-full">
                        RECOMMENDED
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                      Pay directly from GPay, PhonePe, Paytm, BHIM with zero charges
                    </span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'UPI_QR'}
                  onChange={() => setPaymentMethod('UPI_QR')}
                  className="accent-purple-600 w-4 h-4"
                />
              </div>

              {/* Dynamic QR Code Expanded Container */}
              {paymentMethod === 'UPI_QR' && (
                <div className="mt-4 pt-3 border-t border-purple-100">
                  <UpiQrPayment
                    amount={grandTotal}
                    orderId={`RV-${Math.floor(10000 + Math.random() * 90000)}`}
                    onPaymentSuccess={(payDetails) => {
                      completeOrderSuccess(payDetails.paymentId, payDetails.method);
                    }}
                  />
                </div>
              )}
            </div>

            {/* 2. Razorpay Popup Gateway Option */}
            <div
              onClick={() => setPaymentMethod('RAZORPAY')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                paymentMethod === 'RAZORPAY'
                  ? 'border-purple-600 bg-purple-50/40 shadow-xs'
                  : 'border-slate-200 hover:border-purple-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 block">
                      Razorpay Checkout Modal
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Credit / Debit Cards, Netbanking, Wallets, PayLater
                    </span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'RAZORPAY'}
                  onChange={() => setPaymentMethod('RAZORPAY')}
                  className="accent-purple-600 w-4 h-4"
                />
              </div>
            </div>

            {/* 3. Direct UPI Apps Option */}
            <div
              onClick={() => setPaymentMethod('UPI_APP')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                paymentMethod === 'UPI_APP'
                  ? 'border-purple-600 bg-purple-50/40 shadow-xs'
                  : 'border-slate-200 hover:border-purple-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 block">UPI App Quick Pay</span>
                    <span className="text-[11px] text-slate-500">Google Pay, PhonePe, Paytm intent</span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'UPI_APP'}
                  onChange={() => setPaymentMethod('UPI_APP')}
                  className="accent-purple-600 w-4 h-4"
                />
              </div>

              {paymentMethod === 'UPI_APP' && (
                <div className="mt-3 pt-3 border-t border-purple-100 flex gap-2">
                  {['gpay', 'phonepe', 'paytm', 'cred'].map((app) => (
                    <button
                      key={app}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUpiApp(app);
                      }}
                      className={`flex-1 py-2 rounded-xl text-xs font-extrabold uppercase transition-all ${
                        upiApp === app
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {app}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Cash on Delivery */}
            <div
              onClick={() => setPaymentMethod('COD')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                paymentMethod === 'COD'
                  ? 'border-purple-600 bg-purple-50/40 shadow-xs'
                  : 'border-slate-200 hover:border-purple-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-xs text-slate-900 block">Cash on Delivery</span>
                  <span className="text-[11px] text-slate-500">Pay cash or UPI at delivery doorstep</span>
                </div>
              </div>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
                className="accent-purple-600 w-4 h-4"
              />
            </div>
          </div>
        </div>

        {/* Final Price Breakdown & Place Order CTA */}
        <div className="bg-white rounded-3xl p-5 border border-purple-50 card-shadow space-y-3">
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-xs text-slate-400 font-bold block">Final Amount</span>
              <span className="text-2xl font-black text-slate-900">₹{grandTotal}</span>
            </div>
            {totalSavings > 0 && (
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Total Saved: ₹{totalSavings}
              </span>
            )}
          </div>

          {paymentMethod !== 'UPI_QR' && (
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full py-4 px-4 bg-purple-600 hover:bg-purple-700 active:scale-[0.99] text-white font-black text-base rounded-2xl shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 disabled:bg-purple-300"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting to Gateway...</span>
                </div>
              ) : (
                <>
                  <span>
                    {paymentMethod === 'RAZORPAY' ? 'Open Razorpay Modal' : `Pay ₹${grandTotal}`}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>
      </main>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

      <BottomNav />
    </div>
  );
}
