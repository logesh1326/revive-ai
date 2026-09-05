import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Send, ArrowLeft, Bot, User, Check, ShoppingBag, 
  Trash2, Plus, Zap, ArrowRight, RefreshCw, Layers, ChefHat, Camera, QrCode, CreditCard
} from 'lucide-react';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import { useCart } from '../store/CartContext';
import { AI_SAMPLE_BASKETS, PRODUCTS } from '../data/mockData';

export default function AIAssistant() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addMultipleItems, totalCount, grandTotal } = useCart();
  const messagesEndRef = useRef(null);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello Rahul! 👋 I'm your ReviveAI Personal Grocery Assistant. Tell me what you'd like to cook, plan a weekly budget basket, generate a live QR code to pay, or scan a recipe note!",
      timestamp: 'Just now'
    }
  ]);

  const [addedListIds, setAddedListIds] = useState([]);

  // Check if launched with an initial prompt from Home
  useEffect(() => {
    if (location.state?.initialPrompt) {
      handleSend(location.state.initialPrompt);
    }
  }, [location.state]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const query = textToSend || inputPrompt;
    if (!query.trim()) return;

    // Append User Message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      timestamp: 'Just now'
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsTyping(true);

    // AI Response Generation
    setTimeout(() => {
      let aiResponse;
      const lower = query.toLowerCase();

      if (lower.includes('qr') || lower.includes('pay') || lower.includes('razorpay') || lower.includes('checkout')) {
        aiResponse = {
          id: Date.now() + 1,
          sender: 'ai',
          text: `Your current cart total is ₹${grandTotal} (${totalCount} items). You can scan the live UPI QR code or open Razorpay Checkout modal directly below:`,
          isPaymentAction: true,
          timestamp: 'Just now'
        };
      } else if (lower.includes('family') || lower.includes('week') || lower.includes('2000')) {
        const basket = AI_SAMPLE_BASKETS['family_weekly'];
        aiResponse = {
          id: Date.now() + 1,
          sender: 'ai',
          text: `Sure! I've curated a balanced weekly grocery basket for a family of 4, keeping your budget strictly under ₹2,000 with ₹236 in instant savings:`,
          basket: basket,
          timestamp: 'Just now'
        };
      } else if (lower.includes('snack') || lower.includes('healthy') || lower.includes('500')) {
        const basket = AI_SAMPLE_BASKETS['healthy_snacks'];
        aiResponse = {
          id: Date.now() + 1,
          sender: 'ai',
          text: `Here is a high-protein, guilt-free healthy snack selection under ₹500:`,
          basket: basket,
          timestamp: 'Just now'
        };
      } else if (lower.includes('menu') || lower.includes('recipe') || lower.includes('biryani') || lower.includes('paneer') || lower.includes('dinner')) {
        aiResponse = {
          id: Date.now() + 1,
          sender: 'ai',
          text: `I've prepared the full ingredient breakdown for your meal. I also added smart suggestions like Mint leaves and Cold drinks!`,
          basket: {
            title: `Ingredients & Complements for "${query}"`,
            targetBudget: 800,
            estimatedTotal: 629,
            savings: 115,
            items: [
              { name: 'India Gate Super Basmati Rice (5 kg)', qty: '1 pack', price: 499, originalPrice: 590 },
              { name: 'Fresh Nashik Red Onions (1 kg)', qty: '2 kg', price: 70, originalPrice: 90 },
              { name: 'Fresh Farm Tomatoes (1 kg)', qty: '1 kg', price: 38, originalPrice: 48 },
              { name: 'Amul Taaza Milk (1L)', qty: '1 pack', price: 54, originalPrice: 58 }
            ]
          },
          timestamp: 'Just now'
        };
      } else {
        // Dynamic smart response
        aiResponse = {
          id: Date.now() + 1,
          sender: 'ai',
          text: `I've analyzed your request for "${query}". Here are the top fresh essentials ready for 15-min delivery:`,
          basket: {
            title: `Smart Essentials for "${query}"`,
            targetBudget: 500,
            estimatedTotal: 337,
            savings: 58,
            items: [
              { name: 'Amul Taaza Milk (1L)', qty: '2 packs', price: 108, originalPrice: 116 },
              { name: 'Britannia Whole Wheat Bread', qty: '1 pack', price: 45, originalPrice: 50 },
              { name: 'Fresh Farm Tomatoes (1 kg)', qty: '1 kg', price: 38, originalPrice: 48 },
              { name: 'Fortune Sunflower Oil (1L)', qty: '1 pouch', price: 142, originalPrice: 165 }
            ]
          },
          timestamp: 'Just now'
        };
      }

      setIsTyping(false);
      setMessages((prev) => [...prev, aiResponse]);
    }, 1100);
  };

  const handleAddEntireList = (basket, msgId) => {
    addMultipleItems(basket.items);
    setAddedListIds((prev) => [...prev, msgId]);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] pb-24 md:pb-12 text-slate-900 flex flex-col justify-between">
      
      {/* Top Bar */}
      <Navbar />

      <main className="max-w-3xl mx-auto w-full px-4 pt-4 flex-1 flex flex-col">
        
        {/* Assistant Header Banner */}
        <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 rounded-2xl p-4 text-white flex items-center justify-between shadow-md shadow-purple-600/20 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-spin-slow" />
            </div>
            <div>
              <h2 className="font-black text-base tracking-tight flex items-center gap-2">
                <span>ReviveAI Grocery Copilot</span>
                <span className="bg-emerald-400 text-slate-900 font-extrabold text-[9px] px-2 py-0.5 rounded-full">
                  ONLINE
                </span>
              </h2>
              <p className="text-[11px] text-purple-100">
                Natural language list builder & smart budget optimizer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate('/menu-scanner')}
              className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-extrabold transition-colors flex items-center gap-1"
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Menu Scanner</span>
            </button>
            <button
              onClick={() => navigate('/home')}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 space-y-4 overflow-y-auto pb-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-lg ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* Bubble Text */}
                <div
                  className={`p-4 rounded-3xl text-xs sm:text-sm font-medium leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white rounded-br-xs shadow-md shadow-purple-600/20'
                      : 'bg-white text-slate-800 rounded-tl-xs card-shadow border border-purple-50'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Direct Pay / QR Action inside Chat */}
                {msg.isPaymentAction && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-3 bg-white rounded-2xl p-4 border border-purple-100 card-shadow space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-purple-600 block uppercase tracking-wider">
                          Ready for Checkout
                        </span>
                        <span className="text-base font-black text-slate-900">
                          Total Payable: ₹{grandTotal}
                        </span>
                      </div>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ⚡ 15-Min Delivery
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => navigate('/checkout')}
                        className="py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20 transition-all"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Scan UPI QR</span>
                      </button>
                      <button
                        onClick={() => navigate('/checkout')}
                        className="py-2.5 px-3 bg-slate-900 hover:bg-black text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Razorpay Pay</span>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Structured Grocery Basket Card */}
                {msg.basket && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-3 bg-white rounded-2xl p-4 border border-purple-100 card-shadow overflow-hidden"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">
                          Optimized Basket
                        </span>
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                          {msg.basket.title}
                        </h4>
                      </div>
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Save ₹{msg.basket.savings}
                      </span>
                    </div>

                    {/* Basket Items List */}
                    <div className="py-2.5 space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                      {msg.basket.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50/60 border border-slate-100/60"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-purple-600 rounded-full"></span>
                            <span className="font-bold text-slate-800">{item.name}</span>
                            <span className="text-[10px] text-slate-400">({item.qty})</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="text-slate-900">₹{item.price}</span>
                            {item.originalPrice && (
                              <span className="text-[10px] text-slate-400 line-through">
                                ₹{item.originalPrice}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total & 1-Click Action */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-slate-500 font-semibold block">
                          Estimated Total
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-black text-slate-900">
                            ₹{msg.basket.estimatedTotal}
                          </span>
                          <span className="text-[10px] font-extrabold text-emerald-600">
                            (Saved ₹{msg.basket.savings})
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddEntireList(msg.basket, msg.id)}
                        disabled={addedListIds.includes(msg.id)}
                        className={`px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-md ${
                          addedListIds.includes(msg.id)
                            ? 'bg-emerald-600 text-white'
                            : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/25 active:scale-95'
                        }`}
                      >
                        {addedListIds.includes(msg.id) ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Added to Cart!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            <span>Add Entire List to Cart</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center flex-shrink-0 mt-1 font-bold text-xs">
                  U
                </div>
              )}
            </motion.div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-xs font-semibold text-purple-600 bg-white p-3 rounded-2xl w-fit card-shadow"
            >
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>ReviveAI is processing your request...</span>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompt Chips */}
        <div className="py-2 flex gap-2 overflow-x-auto no-scrollbar">
          {[
            'Generate QR Code to Pay',
            'Cook Hyderabadi Biryani for 6',
            'Weekly basket for 4 under ₹2000',
            'Healthy snacks under ₹500'
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold border border-purple-200 flex-shrink-0 transition-colors"
            >
              ✨ {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="pt-2 pb-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 bg-white rounded-2xl p-2 card-shadow border border-purple-100 focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-100 transition-all"
          >
            <button
              type="button"
              onClick={() => navigate('/menu-scanner')}
              className="p-2 rounded-xl text-purple-600 hover:bg-purple-50 transition-colors"
              title="Upload / Scan Image"
            >
              <Camera className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask: 'Generate QR code', 'Pav Bhaji for 8', 'Weekly basket'..."
              className="flex-1 px-2 py-2 text-xs sm:text-sm font-semibold text-slate-800 bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim()}
              className="p-2.5 rounded-xl bg-purple-600 disabled:bg-slate-200 text-white transition-all hover:bg-purple-700 active:scale-95 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
