import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, Navigation, Home, Briefcase, Plus, Check, 
  ArrowRight, Sparkles, Loader2, AlertCircle, Building2 
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';

export default function AddressSetup() {
  const navigate = useNavigate();
  const { currentAddress, saveAddress } = useAuth();

  const [addressType, setAddressType] = useState('Home');
  const [house, setHouse] = useState(currentAddress?.house || '');
  const [street, setStreet] = useState(currentAddress?.street || '');
  const [area, setArea] = useState(currentAddress?.area || '');
  const [landmark, setLandmark] = useState(currentAddress?.landmark || '');
  const [city, setCity] = useState(currentAddress?.city || 'Bengaluru');
  const [state, setState] = useState(currentAddress?.state || 'Karnataka');
  const [pincode, setPincode] = useState(currentAddress?.pincode || '');

  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Use Current Location
  const handleUseLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          setHouse('Flat 402, Green Glen Heights');
          setStreet('100 Feet Road, 4th Block');
          setArea('Koramangala');
          setLandmark('Opposite Forum Mall');
          setCity('Bengaluru');
          setState('Karnataka');
          setPincode('560034');
        },
        () => {
          setIsLocating(false);
          // Default location fill
          setHouse('Flat 201, Sunrise Residency');
          setStreet('MG Road');
          setArea('Indiranagar');
          setLandmark('Near Metro Station');
          setCity('Bengaluru');
          setState('Karnataka');
          setPincode('560038');
        }
      );
    } else {
      setIsLocating(false);
      setHouse('Flat 201, Sunrise Residency');
      setStreet('MG Road');
      setArea('Indiranagar');
      setLandmark('Near Metro Station');
      setCity('Bengaluru');
      setState('Karnataka');
      setPincode('560038');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!house.trim()) errs.house = 'House / Flat number is required.';
    if (!area.trim()) errs.area = 'Area / Locality is required.';
    if (!pincode.trim() || !/^\d{6}$/.test(pincode.trim())) errs.pincode = 'Valid 6-digit PIN code is required.';
    if (!city.trim()) errs.city = 'City is required.';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setIsSaving(true);

    try {
      await saveAddress({
        address_type: addressType,
        house: house.trim(),
        street: street.trim(),
        area: area.trim(),
        landmark: landmark.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        is_default: true,
      });

      navigate('/home');
    } catch (err) {
      console.error('Save address error:', err);
      setErrors({ form: err.message || 'Failed to save address. Please try again.' });
    } finally {
      setIsSaving(false);
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
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            STEP 2 OF 2
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-6">
          <div className="w-full h-full bg-emerald-500 rounded-full"></div>
        </div>
      </div>

      {/* Main Address Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 card-shadow border border-purple-50 my-auto shadow-xl"
      >
        <div className="mb-6">
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 mb-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>Delivery Location</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Where should we deliver?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Fresh groceries will be delivered to this address in 15–25 mins.
          </p>
        </div>

        {/* Use Current Location Button */}
        <button
          type="button"
          onClick={handleUseLocation}
          disabled={isLocating}
          className="w-full mb-5 py-3 px-4 bg-purple-50 hover:bg-purple-100/80 active:scale-[0.99] text-purple-700 font-bold text-xs sm:text-sm rounded-2xl border border-purple-200 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              <span>Detecting location...</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4 text-purple-600" />
              <span>Use Current Location</span>
            </>
          )}
        </button>

        {/* Address Type Selector */}
        <div className="mb-4">
          <label className="block text-xs font-extrabold text-slate-700 mb-2">
            Save Address As
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'Home', label: 'Home', icon: Home },
              { id: 'Work', label: 'Work', icon: Briefcase },
              { id: 'Other', label: 'Other', icon: MapPin },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setAddressType(id)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  addressType === id
                    ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-xs font-black'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Manual Address Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* House / Flat */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
              House / Flat / Building *
            </label>
            <input
              type="text"
              value={house}
              onChange={(e) => {
                setHouse(e.target.value);
                if (errors.house) setErrors((prev) => ({ ...prev, house: null }));
              }}
              placeholder="e.g. Flat 402, Green Glen Heights"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white transition-all"
            />
            {errors.house && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.house}</p>}
          </div>

          {/* Street & Area */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                Street / Road
              </label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="e.g. 100 Feet Road"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                Area / Locality *
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => {
                  setArea(e.target.value);
                  if (errors.area) setErrors((prev) => ({ ...prev, area: null }));
                }}
                placeholder="e.g. Koramangala"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white transition-all"
              />
              {errors.area && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.area}</p>}
            </div>
          </div>

          {/* Landmark */}
          <div>
            <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
              Landmark (Optional)
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Near Forum Mall"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white transition-all"
            />
          </div>

          {/* City, State & PIN Code */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                City *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                State
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-slate-700 mb-1">
                PIN Code *
              </label>
              <input
                type="text"
                maxLength="6"
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value.replace(/\D/g, ''));
                  if (errors.pincode) setErrors((prev) => ({ ...prev, pincode: null }));
                }}
                placeholder="560034"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-purple-600 focus:bg-white"
              />
              {errors.pincode && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.pincode}</p>}
            </div>
          </div>

          {/* Save Address Button */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full mt-4 py-4 px-4 bg-purple-600 hover:bg-purple-700 active:scale-[0.99] disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-purple-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Address...</span>
              </>
            ) : (
              <>
                <span>Save Address & Enter Store</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Footer */}
      <div className="w-full max-w-md text-center py-4">
        <p className="text-[11px] text-slate-400 font-medium">
          Step 2 of 2 — Setting up your delivery address
        </p>
      </div>
    </div>
  );
}
