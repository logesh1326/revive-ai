import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Check, Plus, Home, Briefcase, Navigation } from 'lucide-react';
import { useAuth } from '../store/AuthContext';

export default function AddressModal({ isOpen, onClose }) {
  const { user, currentAddress, updateAddress } = useAuth();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [form, setForm] = useState({
    type: 'Home',
    building: '',
    area: '',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600017'
  });

  if (!isOpen) return null;

  const handleSelect = (addr) => {
    updateAddress(addr);
    onClose();
  };

  const handleSaveNew = (e) => {
    e.preventDefault();
    if (!form.building || !form.area) return;

    const newAddr = {
      id: 'addr_' + Date.now(),
      ...form,
      isDefault: true
    };
    updateAddress(newAddr);
    setIsAddingNew(false);
    onClose();
  };

  const handleUseLocation = () => {
    const detected = {
      id: 'addr_auto',
      type: 'Home',
      building: 'Apt 304, Royal Palms',
      area: 'Anna Nagar West',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600040',
      isDefault: true
    };
    updateAddress(detected);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-purple-100 overflow-hidden relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Delivery Address</h3>
              <p className="text-xs text-slate-500">Choose where you want your groceries delivered</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isAddingNew ? (
            <div className="py-4 space-y-3">
              {/* Quick GPS button */}
              <button
                onClick={handleUseLocation}
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100/70 border border-purple-200/80 text-purple-700 transition-all font-semibold text-sm group"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Navigation className="w-4 h-4" />
                </div>
                <div className="text-left flex-1">
                  <span className="block font-bold text-xs text-purple-900">Use Current GPS Location</span>
                  <span className="block text-[11px] text-purple-600">Auto-detect Chennai Delivery Hub</span>
                </div>
              </button>

              {/* Saved Addresses List */}
              <div className="space-y-2 mt-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                  Saved Addresses
                </span>
                
                {(user?.savedAddresses || [currentAddress]).map((addr, idx) => {
                  const isSelected = currentAddress?.building === addr.building;
                  return (
                    <div
                      key={addr.id || idx}
                      onClick={() => handleSelect(addr)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-2 rounded-xl mt-0.5 ${
                        isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {addr.type === 'Work' ? <Briefcase className="w-4 h-4" /> : <Home className="w-4 h-4" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-900">{addr.type}</span>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-700 truncate mt-0.5">{addr.building}</p>
                        <p className="text-[11px] text-slate-500">{addr.area}, {addr.city} - {addr.pincode}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Button */}
              <button
                onClick={() => setIsAddingNew(true)}
                className="w-full mt-2 py-3 rounded-2xl border-2 border-dashed border-purple-200 hover:border-purple-500 hover:bg-purple-50/50 text-purple-700 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" /> Add New Address
              </button>
            </div>
          ) : (
            /* Add Address Form */
            <form onSubmit={handleSaveNew} className="py-3 space-y-3">
              <div className="flex gap-2">
                {['Home', 'Work', 'Other'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition-all ${
                      form.type === t
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">House / Flat / Building *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 402, Green Glen Heights"
                  value={form.building}
                  onChange={(e) => setForm({ ...form, building: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Area / Street / Landmark *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Outer Ring Road, T. Nagar"
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700">PIN Code</label>
                  <input
                    type="text"
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20"
                >
                  Save Address
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
