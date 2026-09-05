import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Camera, Upload, Sparkles, RefreshCw, FileText, 
  CheckCircle2, Loader2, Image as ImageIcon, AlertCircle, 
  Search, ShieldCheck, Zap, ArrowRight, Brain, Edit3, Trash2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import { api } from '../api/client';
import { useAuth } from '../store/AuthContext';

const SAMPLE_LISTS = [
  {
    title: '📝 Handwritten Weekly List',
    preview: 'potatoes 1kg, almond milk, pastina, eggs (2), paper towels ?...',
    text: `potatoes 1kg\npeas & carrots\npastina\ngarbage bags\ndog treats\naluminum foil\nalmond milk\ncreamer vanilla\neggs (2)\ncrushed tomatoes\nhot sauce\npaper towels ?`,
    imageUrl: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: '🥛 Breakfast & Dairy List',
    preview: 'Almond milk 1L, Whole wheat bread, Eggs 6, Bananas, Greek yogurt...',
    text: `Almond milk 1L\nWhole wheat bread\nEggs 6\nButter 100g\nBananas 1 dozen\nApples 1kg\nGreek yogurt\nCoffee powder ?`,
    imageUrl: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: '🍛 Indian Kitchen Staples',
    preview: 'Amul milk 2L, Aashirvaad atta 5kg, Fortune oil 1L, Tomatoes 1kg...',
    text: `Amul milk 2L\nAashirvaad atta 5kg\nFortune sunflower oil 1L\nTomatoes 1kg\nOnions 2kg\nPotatos 1kg\nGinger & Garlic\nGreen chillies 100g\nEggs 12 pack\nTea powder (Red Label 500g)`,
    imageUrl: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=600&q=80',
  },
];

const AI_STAGES = [
  { icon: '📷', title: 'Reading your list...', desc: 'Extracting handwritten strokes and text coordinates' },
  { icon: '✍️', title: 'Understanding handwriting...', desc: 'Resolving messy handwriting, spelling & abbreviations' },
  { icon: '🧠', title: 'Identifying grocery items...', desc: 'Structuring quantities, units and item categories' },
  { icon: '🔎', title: 'Finding matching products...', desc: 'Scanning catalog for in-stock brands and fresh items' },
  { icon: '✨', title: 'Personalizing recommendations...', desc: 'Applying your brand affinities and Contextual Bandit RL' },
  { icon: '🛒', title: 'Building your cart...', desc: 'Assembling optimal smart basket with savings' },
];

export default function ScanGroceryList() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('photo'); // 'photo' | 'text'
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Compress & read image to base64
  const processImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Max dimension 1280px for high OCR accuracy + low latency
        const maxDim = 1280;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setSelectedImage(dataUrl);
        setActiveTab('photo');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processImageFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processImageFile(file);
  };

  // Select Sample List
  const handleSelectSample = (sample) => {
    setSelectedImage(sample.imageUrl);
    setSelectedText(sample.text);
    setError('');
  };

  // Start AI Processing
  const handleStartScan = async () => {
    if (!selectedImage && (!selectedText || selectedText.trim() === '')) {
      setError('Please upload a photo, paste list text, or choose a sample list below.');
      return;
    }

    setError('');
    setIsProcessing(true);
    setCurrentStage(0);

    // Stage progression animation
    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => {
        if (prev < AI_STAGES.length - 1) return prev + 1;
        return prev;
      });
    }, 700);

    try {
      const response = await api.scanGroceryList({
        image: selectedImage || undefined,
        raw_text: selectedText.trim() || undefined,
        customer_id: user?.id || 'default',
      });

      clearInterval(stageInterval);
      setCurrentStage(AI_STAGES.length); // Done state

      setTimeout(() => {
        setIsProcessing(false);
        try {
          sessionStorage.setItem('revive_last_scan', JSON.stringify(response));
          if (selectedImage) sessionStorage.setItem('revive_last_scan_img', selectedImage);
        } catch (e) {
          // ignore storage quota error
        }
        navigate('/smart-cart-review', {
          state: {
            scanResult: response,
            imagePreview: selectedImage,
          },
        });
      }, 600);
    } catch (err) {
      clearInterval(stageInterval);
      setIsProcessing(false);
      console.error('Scan list failed:', err);
      setError(err.message || 'Failed to process grocery list. Please check your connection and try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] pb-24 md:pb-12 text-slate-900">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 pt-4 space-y-5">
        {/* Back Link & AI Profile */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </button>
          
          <button
            onClick={() => navigate('/ai-preferences')}
            className="flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-full transition-colors cursor-pointer border border-purple-200"
          >
            <Brain className="w-3.5 h-3.5 text-purple-600" />
            <span>My AI Profile & RL Insights</span>
          </button>
        </div>

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-950 text-white shadow-xl relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-purple-200 border border-white/15 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Vision OCR + RL Contextual Bandit</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              📝 Scan My Grocery List
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 font-medium mt-1 max-w-lg">
              Upload a handwritten note, smartphone photo, or paste your items. ReviveAI will extract your list, match your favorite catalog brands, and assemble an optimized smart basket.
            </p>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] w-48 h-48 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
        </motion.div>

        {/* Main Input Studio Card */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-100 card-shadow space-y-4">
          
          {/* Tabs: Photo Upload vs Direct Text */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => setActiveTab('photo')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'photo'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Photo / Image Upload</span>
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'text'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>Type / Paste Text</span>
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 p-3.5 rounded-2xl border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span className="flex-1 font-semibold">{error}</span>
            </div>
          )}

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* TAB 1: Photo Upload */}
          {activeTab === 'photo' && (
            <div className="space-y-4">
              {!selectedImage ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-all ${
                    isDragging 
                      ? 'border-purple-600 bg-purple-50/50 scale-[0.99]' 
                      : 'border-purple-200/80 bg-purple-50/20'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-3 shadow-xs">
                    <Camera className="w-7 h-7" />
                  </div>

                  <p className="text-sm font-black text-slate-900">
                    Capture or Upload Grocery List
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Supports handwritten notes, smartphone photos, receipts, or sticky notes
                  </p>

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Browse Files</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-72 bg-slate-900 flex items-center justify-center">
                    <img
                      src={selectedImage}
                      alt="Grocery List Preview"
                      className="max-h-72 w-auto object-contain"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[11px] font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Photo Ready</span>
                    </div>
                  </div>

                  {/* Optional Extracted Text Preview / Edit */}
                  {selectedText && (
                    <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-purple-900">
                        <span>List Items Preview:</span>
                        <span className="text-[10px] text-slate-500">{selectedText.split('\n').filter(Boolean).length} items recognized</span>
                      </div>
                      <textarea
                        value={selectedText}
                        onChange={(e) => setSelectedText(e.target.value)}
                        rows={3}
                        className="w-full bg-white border border-purple-200 rounded-xl p-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Items from photo..."
                      />
                    </div>
                  )}

                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setSelectedText('');
                      }}
                      className="py-3 px-4 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Change Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleStartScan}
                      className="flex-1 py-3.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Scan List with AI</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Direct Text Input */}
          {activeTab === 'text' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  Enter Grocery Items (One item per line or comma-separated)
                </label>
                <textarea
                  value={selectedText}
                  onChange={(e) => setSelectedText(e.target.value)}
                  rows={6}
                  placeholder={`potatoes 1kg\nalmond milk 1L\npastina\neggs (6)\ntomatoes 1kg\ncoffee powder ?`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedText('')}
                  disabled={!selectedText}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs flex items-center gap-1 disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartScan}
                  disabled={!selectedText || selectedText.trim() === ''}
                  className="flex-1 py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-sm shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-40"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Process List with AI</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Sample Handwritten Lists for Instant Demo */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2.5">
              💡 Or Try A 1-Click Sample List:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SAMPLE_LISTS.map((sample, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectSample(sample)}
                  className="p-3 rounded-2xl border border-purple-100 bg-purple-50/40 hover:bg-purple-50 hover:border-purple-300 transition-all cursor-pointer group text-left"
                >
                  <p className="text-xs font-black text-purple-950 group-hover:text-purple-700 flex items-center justify-between">
                    <span>{sample.title}</span>
                    <Sparkles className="w-3 h-3 text-purple-400 group-hover:text-purple-600" />
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-1 line-clamp-2">
                    {sample.preview}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Safety Guarantee */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-2.5 text-xs text-emerald-800 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>The AI will only match catalog items and build a suggested basket. You have 100% control to review and confirm before placing any order.</span>
        </div>
      </main>

      <BottomNav />

      {/* 6-Stage Animated Purple AI Processing Modal */}
      <AnimatePresence>
        {isProcessing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-purple-100 text-center relative overflow-hidden"
            >
              {/* Animated Icon Glow */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center text-3xl mx-auto mb-5 shadow-xl shadow-purple-600/30 animate-pulse">
                {AI_STAGES[Math.min(currentStage, AI_STAGES.length - 1)]?.icon || '🛒'}
              </div>

              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {currentStage >= AI_STAGES.length
                  ? 'Your smart cart is ready! 🎉'
                  : AI_STAGES[currentStage]?.title}
              </h3>

              <p className="text-xs text-slate-500 font-medium mt-1 min-h-[20px]">
                {currentStage >= AI_STAGES.length
                  ? 'Redirecting to smart cart review...'
                  : AI_STAGES[currentStage]?.desc}
              </p>

              {/* Progress Stepper */}
              <div className="mt-6 space-y-2 text-left">
                {AI_STAGES.map((stg, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
                      idx === currentStage
                        ? 'bg-purple-50 text-purple-900 font-extrabold border border-purple-200'
                        : idx < currentStage
                        ? 'text-emerald-700 font-bold opacity-75'
                        : 'text-slate-400 font-medium opacity-40'
                    }`}
                  >
                    <span className="text-sm">{stg.icon}</span>
                    <span className="text-xs flex-1">{stg.title}</span>
                    {idx < currentStage && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    {idx === currentStage && <Loader2 className="w-4 h-4 animate-spin text-purple-600" />}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
