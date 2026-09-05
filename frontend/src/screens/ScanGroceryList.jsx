import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Camera, Upload, Sparkles, RefreshCw, FileText, 
  CheckCircle2, Loader2, Image as ImageIcon, AlertCircle, 
  Search, ShieldCheck, Zap, ArrowRight, Brain 
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

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  // Handle File Upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
      setSelectedText('');
      setError('');
    };
    reader.readAsDataURL(file);
  };

  // Handle Drag and Drop
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
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result);
      setSelectedText('');
      setError('');
    };
    reader.readAsDataURL(file);
  };

  // Select Sample List
  const handleSelectSample = (sample) => {
    setSelectedImage(sample.imageUrl);
    setSelectedText(sample.text);
    setError('');
  };

  // Start AI Processing
  const handleStartScan = async () => {
    if (!selectedImage && !selectedText) {
      setError('Please upload a photo or select a sample grocery list.');
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
        image: selectedImage,
        raw_text: selectedText,
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
          // ignore quota error
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
      setError(err.message || 'Failed to process grocery list. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] pb-24 md:pb-12 text-slate-900">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 pt-4 space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </button>
          
          <button
            onClick={() => navigate('/ai-preferences')}
            className="flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900 transition-colors cursor-pointer"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>My AI Profile</span>
          </button>
        </div>

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-950 text-white shadow-xl relative overflow-hidden"
        >
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-purple-200 border border-white/15 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>Vision OCR + RL Contextual Bandit</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              📝 Scan My Grocery List
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 font-medium mt-1.5 max-w-lg">
              Take a photo of your handwritten or printed grocery list. ReviveAI will extract your items, match your favorite brands, and build a smart cart in seconds.
            </p>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] w-48 h-48 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
        </motion.div>

        {/* Image Upload Area */}
        <div className="p-6 rounded-3xl bg-white border border-slate-100 card-shadow space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Upload List Photo
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Take a clear photo of your grocery list or select a sample below.
              </p>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 p-3 rounded-2xl border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!selectedImage ? (
            /* Upload Dropzone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
                isDragging 
                  ? 'border-purple-600 bg-purple-50/50 scale-[0.99]' 
                  : 'border-purple-200/80 bg-purple-50/20 hover:border-purple-400 hover:bg-purple-50/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Camera className="w-7 h-7" />
              </div>

              <p className="text-sm font-extrabold text-slate-900">
                Click to Take Photo or Upload Image
              </p>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Supports handwriting, smartphone photos, receipts, or notes (JPG, PNG)
              </p>

              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs">
                  📸 Camera
                </span>
                <span className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl shadow-xs">
                  📁 Browse Files
                </span>
              </div>
            </div>
          ) : (
            /* Image Preview */
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-h-72 bg-slate-900 flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Grocery List Preview"
                  className="max-h-72 w-auto object-contain"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-[11px] font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Photo Ready</span>
                </div>
              </div>

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
                  <span>Retake / Change Photo</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartScan}
                  className="flex-1 py-3 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-sm shadow-md shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Scan List with AI</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Sample Handwritten Lists for Instant Demo */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2.5">
              Or Try A Sample Handwritten List:
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
          <span>The AI will only suggest products and build a draft cart. You will review and confirm everything before adding to cart.</span>
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
              {/* Spinning Glow */}
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
