import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, CheckCircle2, Clock, Phone, MessageSquare, 
  MapPin, ShieldCheck, ChevronDown, ChevronUp, Navigation, Package
} from 'lucide-react';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import { useOrder } from '../store/OrderContext';

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeOrder, advanceOrderStatus, orders } = useOrder();

  const currentOrder = activeOrder || orders.find((o) => o.id === id) || orders[0];
  const [currentStage, setCurrentStage] = useState(currentOrder?.stageIndex || 1);
  const [showItems, setShowItems] = useState(false);

  const stages = [
    { title: 'Order Confirmed', subtitle: 'Store accepted your list', time: '12:20 PM' },
    { title: 'Packing your groceries', subtitle: 'Items packed in insulated bags', time: '12:23 PM' },
    { title: 'Picked up by rider', subtitle: 'Ramesh is at local hub', time: '12:27 PM' },
    { title: 'Out for delivery', subtitle: 'On the way to your address', time: '12:31 PM' },
    { title: 'Delivered', subtitle: 'Handed over at doorstep', time: '12:40 PM' }
  ];

  // Advance stage for interactive demonstration
  const handleAdvance = () => {
    const next = (currentStage + 1) % stages.length;
    setCurrentStage(next);
    if (currentOrder) {
      advanceOrderStatus(currentOrder.id, next);
    }
  };

  const eta = Math.max(4, 22 - currentStage * 5);

  return (
    <div className="min-h-screen bg-[#FAFAFC] pb-24 md:pb-12 text-slate-900">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 pt-3 space-y-4">
        
        {/* Tracking Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/home')}
              className="p-2 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Order #{currentOrder?.id || id || 'RV-10284'}
              </h1>
              <p className="text-xs text-purple-700 font-bold">Express Delivery</p>
            </div>
          </div>

          {/* Simulate Next Stage Button */}
          <button
            onClick={handleAdvance}
            className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 text-[11px] font-extrabold transition-colors border border-purple-200"
          >
            ⚡ Advance Stage Demo
          </button>
        </div>

        {/* ETA & Map Simulation Card */}
        <div className="bg-white rounded-3xl p-5 border border-purple-100 card-shadow overflow-hidden relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                {currentStage === 4 ? 'Status' : 'Estimated Arrival'}
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                {currentStage === 4 ? 'Delivered 🎉' : `Arriving in ${eta} mins`}
              </h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-purple-600/30">
              🛵
            </div>
          </div>

          {/* Interactive Map Visual Placeholder */}
          <div className="w-full h-44 rounded-2xl bg-slate-100 relative overflow-hidden border border-slate-200/80 flex items-center justify-center">
            {/* Map Roads Graphic */}
            <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#CBD5E1" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              <path
                d="M 50 120 Q 150 40 300 100 T 550 60"
                fill="none"
                stroke="#7C3AED"
                strokeWidth="4"
                strokeDasharray="6 6"
              />
            </svg>

            {/* Hub Point */}
            <div className="absolute left-12 bottom-8 flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                🏬
              </div>
              <span className="text-[9px] font-extrabold text-slate-600 mt-1 bg-white/90 px-1.5 rounded-sm">
                Hub
              </span>
            </div>

            {/* Rider Moving Marker */}
            <motion.div
              animate={{
                x: [-20, 20, -20],
                y: [-5, 5, -5]
              }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="absolute z-10 flex flex-col items-center"
            >
              <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-lg shadow-xl shadow-purple-600/40 border-2 border-white">
                🛵
              </div>
              <span className="text-[10px] font-black text-purple-900 bg-white/95 px-2 py-0.5 rounded-full shadow-xs mt-1 border border-purple-100">
                Ramesh is moving
              </span>
            </motion.div>

            {/* Destination Point */}
            <div className="absolute right-12 top-6 flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-md">
                🏠
              </div>
              <span className="text-[9px] font-extrabold text-emerald-800 mt-1 bg-white/90 px-1.5 rounded-sm">
                Your Home
              </span>
            </div>
          </div>
        </div>

        {/* Live Tracking Stages Stepper */}
        <div className="bg-white rounded-3xl p-5 border border-purple-50 card-shadow">
          <h3 className="font-extrabold text-sm text-slate-900 mb-4">Live Order Progress</h3>

          <div className="space-y-4">
            {stages.map((stage, idx) => {
              const isCompleted = idx < currentStage;
              const isCurrent = idx === currentStage;
              return (
                <div key={idx} className="flex items-start gap-3 relative">
                  {/* Vertical connecting line */}
                  {idx < stages.length - 1 && (
                    <div
                      className={`absolute left-3.5 top-7 bottom-0 w-0.5 -mb-4 ${
                        idx < currentStage ? 'bg-purple-600' : 'bg-slate-200'
                      }`}
                    />
                  )}

                  {/* Stage Icon */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all ${
                      isCompleted
                        ? 'bg-purple-600 text-white'
                        : isCurrent
                        ? 'bg-purple-100 text-purple-700 border-2 border-purple-600 animate-pulse'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-extrabold ${isCurrent ? 'text-purple-700 font-black' : 'text-slate-800'}`}>
                        {stage.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{stage.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{stage.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Partner Details */}
        <div className="bg-white rounded-3xl p-5 border border-purple-50 card-shadow flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center font-bold text-xl text-purple-700">
              👨‍💼
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-slate-900">Ramesh Kumar</span>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-md">
                  ⭐ 4.9
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block font-medium">1,420 orders delivered</span>
              <span className="text-[10px] text-purple-700 font-bold">Vaccinated & Temperature Checked</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="tel:+919840123456"
              className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors"
              title="Call Delivery Partner"
            >
              <Phone className="w-4 h-4" />
            </a>
            <button
              onClick={() => alert('Opening live chat with delivery partner...')}
              className="p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 transition-colors"
              title="Message Partner"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Order Items Accordion */}
        <div className="bg-white rounded-3xl p-4 border border-purple-50 card-shadow">
          <button
            onClick={() => setShowItems(!showItems)}
            className="w-full flex items-center justify-between text-xs font-extrabold text-slate-800"
          >
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-600" />
              <span>Items in this Order ({currentOrder?.items?.length || 3})</span>
            </div>
            {showItems ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showItems && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
              {(currentOrder?.items || [
                { name: 'Amul Taaza Milk (1L)', quantity: 2, price: 54 },
                { name: 'Britannia 100% Whole Wheat Bread', quantity: 1, price: 45 },
                { name: 'Fresh Farm Tomatoes (1 kg)', quantity: 1, price: 38 }
              ]).map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs text-slate-700 font-medium">
                  <span>{item.quantity} × {item.name}</span>
                  <span className="font-bold text-slate-900">₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-100 flex justify-between text-xs font-black text-slate-900">
                <span>Total Paid</span>
                <span>₹{currentOrder?.totalAmount || 191}</span>
              </div>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
