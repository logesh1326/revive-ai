import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, MapPin, ShoppingBag, CreditCard, Heart, 
  Sparkles, HelpCircle, LogOut, ChevronRight, ArrowLeft, 
  ShieldCheck, Bell, Edit3, Key
} from 'lucide-react';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import { useAuth } from '../store/AuthContext';
import { useOrder } from '../store/OrderContext';
import ApiKeyModal from '../components/ApiKeyModal';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, currentAddress, logout } = useAuth();
  const { orders } = useOrder();

  const [dietPreference, setDietPreference] = useState('Vegetarian');
  const [budgetCap, setBudgetCap] = useState('₹2,500 / week');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] pb-24 md:pb-12 text-slate-900">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 pt-3 space-y-4">
        
        {/* Profile Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/home')}
              className="p-2 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">My Profile</h1>
          </div>

          <button
            onClick={() => setIsApiKeyModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Key className="w-3.5 h-3.5 text-purple-600" />
            <span>API & Keys</span>
          </button>
        </div>

        {/* User Card */}
        <div className="bg-white rounded-3xl p-5 border border-purple-50 card-shadow flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                alt={user?.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-200"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">{user?.name || 'Rahul Sharma'}</h2>
              <span className="text-xs text-slate-500 block">{user?.phone || '+91 98765 43210'}</span>
              <span className="text-xs text-slate-400 block">{user?.email || 'rahul.sharma@gmail.com'}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/profile-setup')}
            className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition-colors flex items-center gap-1"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>
        </div>

        {/* AI Grocery Preferences */}
        <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50/30 rounded-3xl p-5 border border-purple-100 card-shadow space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">AI Grocery Intelligence Settings</h3>
              <span className="text-[11px] text-slate-500 font-medium">Controls how ReviveAI builds your baskets</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-white rounded-2xl border border-purple-100">
              <span className="text-[11px] text-slate-400 font-bold block">Dietary Mode</span>
              <div className="flex gap-2 mt-1">
                {['Vegetarian', 'Eggetarian', 'All'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDietPreference(d)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      dietPreference === d ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl border border-purple-100">
              <span className="text-[11px] text-slate-400 font-bold block">Weekly Budget Cap</span>
              <span className="text-xs font-black text-slate-900 block mt-1">{budgetCap}</span>
            </div>
          </div>
        </div>

        {/* Saved Addresses Section */}
        <div className="bg-white rounded-3xl p-5 border border-purple-50 card-shadow space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-600" />
              <h3 className="font-extrabold text-sm text-slate-900">Saved Addresses</h3>
            </div>
            <button
              onClick={() => navigate('/address-setup')}
              className="text-xs font-bold text-purple-600 hover:underline"
            >
              + Add New
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between">
            <div>
              <span className="font-extrabold text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                {currentAddress?.type || 'Home'} (Default)
              </span>
              <p className="text-xs font-bold text-slate-800 mt-1">{currentAddress?.building}</p>
              <p className="text-[11px] text-slate-500">{currentAddress?.area}, {currentAddress?.city} - {currentAddress?.pincode}</p>
            </div>
            <button
              onClick={() => navigate('/address-setup')}
              className="text-xs text-slate-400 hover:text-purple-600"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Order History */}
        <div className="bg-white rounded-3xl p-5 border border-purple-50 card-shadow space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-purple-600" />
              <h3 className="font-extrabold text-sm text-slate-900">Recent Orders</h3>
            </div>
          </div>

          <div className="space-y-2.5">
            {orders.map((order) => (
              <div
                key={order.id}
                onClick={() => navigate(`/order-tracking/${order.id}`)}
                className="p-3.5 rounded-2xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">Order #{order.id}</span>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {order.status}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {order.items?.length || 3} items • ₹{order.totalAmount}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Support & Logout */}
        <div className="bg-white rounded-3xl p-3 border border-purple-50 card-shadow divide-y divide-slate-100">
          <button
            onClick={() => alert('ReviveAI 24x7 Customer Helpline: 1800-REVIVE-AI')}
            className="w-full py-3 px-3 flex items-center justify-between text-xs font-extrabold text-slate-700 hover:text-purple-700 hover:bg-slate-50 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Help & Support</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-3 px-3 flex items-center justify-between text-xs font-extrabold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Log Out</span>
            </div>
            <ChevronRight className="w-4 h-4 text-red-400" />
          </button>
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
