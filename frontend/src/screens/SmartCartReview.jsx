import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Sparkles, CheckCircle2, AlertCircle, HelpCircle, 
  Plus, Minus, Trash2, RotateCcw, ShoppingBag, ArrowRight, 
  Info, Check, ShieldCheck, Tag, Zap, ChevronDown, ChevronUp 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import { useCart } from '../store/CartContext';
import { useAuth } from '../store/AuthContext';
import { api } from '../api/client';

export default function SmartCartReview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const scanResult = location.state?.scanResult;
  const imagePreview = location.state?.imagePreview;

  const [matches, setMatches] = useState(() => scanResult?.matches || []);
  const [selectedIndices, setSelectedIndices] = useState(() => {
    // Select all by default
    const set = new Set();
    (scanResult?.matches || []).forEach((_, idx) => set.add(idx));
    return set;
  });

  const [expandedAlternatives, setExpandedAlternatives] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Re-compute estimated totals based on active selections
  const { totalAmount, totalSavings, selectedCount } = React.useMemo(() => {
    let amt = 0;
    let sav = 0;
    let count = 0;

    matches.forEach((m, idx) => {
      if (selectedIndices.has(idx)) {
        const qty = m.quantity || 1;
        const p = m.recommended_product?.price || 0;
        const orig = m.recommended_product?.original_price || p;
        amt += p * qty;
        sav += Math.max(0, (orig - p) * qty);
        count += 1;
      }
    });

    return { totalAmount: amt, totalSavings: sav, selectedCount: count };
  }, [matches, selectedIndices]);

  // Toggle item selection
  const handleToggleSelect = (idx) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
        // Telemetry feedback: REMOVE
        const item = matches[idx];
        if (item?.recommended_product) {
          api.sendAiFeedback({
            customer_id: user?.id || 'default',
            product_id: item.recommended_product.sku,
            action: 'REMOVE',
            brand: item.recommended_product.brand,
            category: item.category,
          }).catch(() => {});
        }
      } else {
        next.add(idx);
        // Telemetry feedback: ADD
        const item = matches[idx];
        if (item?.recommended_product) {
          api.sendAiFeedback({
            customer_id: user?.id || 'default',
            product_id: item.recommended_product.sku,
            action: 'ADD',
            brand: item.recommended_product.brand,
            category: item.category,
          }).catch(() => {});
        }
      }
      return next;
    });
  };

  // Quantity Stepper
  const handleUpdateQty = (idx, delta) => {
    setMatches((prev) => {
      const next = [...prev];
      const curQty = next[idx].quantity || 1;
      const newQty = Math.max(1, curQty + delta);
      next[idx] = { ...next[idx], quantity: newQty };
      return next;
    });
  };

  // Replace Recommended Product with an Alternative
  const handleSwitchAlternative = (itemIndex, altProduct) => {
    setMatches((prev) => {
      const next = [...prev];
      const current = next[itemIndex];
      const oldProduct = current.recommended_product;

      next[itemIndex] = {
        ...current,
        recommended_product: altProduct,
        reason: `Switched to alternative: ${altProduct.name}`,
        confidence_badge: 'HIGH',
      };

      // Telemetry feedback: REPLACE
      api.sendAiFeedback({
        customer_id: user?.id || 'default',
        product_id: oldProduct?.sku,
        action: 'REPLACE',
      }).catch(() => {});

      api.sendAiFeedback({
        customer_id: user?.id || 'default',
        product_id: altProduct.sku,
        action: 'ADD',
        brand: altProduct.brand,
        category: current.category,
      }).catch(() => {});

      return next;
    });

    // Close alternatives accordion
    setExpandedAlternatives((prev) => ({ ...prev, [itemIndex]: false }));
  };

  // Add All / Selected to Cart
  const handleAddToCart = () => {
    setIsAdding(true);
    setAddedAnimation(true);

    matches.forEach((item, idx) => {
      if (selectedIndices.has(idx) && item.recommended_product) {
        const prod = item.recommended_product;
        // Map catalog product to Cart format
        addToCart({
          id: prod.sku,
          name: prod.name,
          category: prod.category || item.category,
          brand: prod.brand,
          price: prod.price,
          originalPrice: prod.original_price || prod.price + 15,
          unit: `${prod.pack_size || item.quantity} ${prod.unit || ''}`.trim(),
          image: prod.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80',
          inStock: true,
        }, item.quantity || 1);

        // Record positive reward for Contextual Bandit
        api.sendAiFeedback({
          customer_id: user?.id || 'default',
          product_id: prod.sku,
          action: 'ADD',
          brand: prod.brand,
          category: item.category,
        }).catch(() => {});
      }
    });

    setTimeout(() => {
      setIsAdding(false);
      navigate('/cart');
    }, 800);
  };

  if (!matches || matches.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFC] pb-24 text-slate-900">
        <Navbar />
        <main className="max-w-xl mx-auto px-4 pt-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto text-2xl">
            📝
          </div>
          <h2 className="text-xl font-black text-slate-900">No List Found</h2>
          <p className="text-xs text-slate-500 font-medium">
            Please scan your grocery list photo to build a smart cart.
          </p>
          <button
            onClick={() => navigate('/scan-grocery-list')}
            className="px-5 py-3 bg-purple-600 text-white font-extrabold text-xs rounded-2xl shadow-md shadow-purple-600/20"
          >
            Scan Grocery List
          </button>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFC] pb-28 md:pb-16 text-slate-900">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-4 space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/scan-grocery-list')}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Scan Another List</span>
          </button>

          <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Smart Cart</span>
          </span>
        </div>

        {/* AI Success Summary Hero */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-950 text-white shadow-xl relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold text-purple-200 border border-white/15 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>AI Grocery-List Agent</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Your list is ready! 🎉
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-bold text-purple-200">
                <span className="bg-white/15 px-2.5 py-0.5 rounded-lg">
                  {matches.length} items recognized
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-lg border border-emerald-400/30">
                  {matches.filter((m) => m.confidence_badge === 'HIGH').length} matched automatically
                </span>
                {matches.some((m) => m.confidence_badge !== 'HIGH') && (
                  <span className="bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-lg border border-amber-400/30">
                    {matches.filter((m) => m.confidence_badge !== 'HIGH').length} need review
                  </span>
                )}
              </div>
            </div>

            {/* Price & Savings Pill */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-left sm:text-right shrink-0">
              <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block">
                Estimated Total
              </span>
              <p className="text-2xl sm:text-3xl font-black text-white">
                ₹{totalAmount}
              </p>
              {totalSavings > 0 && (
                <p className="text-xs font-bold text-emerald-400 mt-0.5">
                  ₹{totalSavings} estimated savings
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* List of Matched Items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Smart Identified Products ({selectedCount} Selected)
            </h2>
            <button
              onClick={() => {
                if (selectedIndices.size === matches.length) {
                  setSelectedIndices(new Set());
                } else {
                  const all = new Set();
                  matches.forEach((_, idx) => all.add(idx));
                  setSelectedIndices(all);
                }
              }}
              className="text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors cursor-pointer"
            >
              {selectedIndices.size === matches.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="space-y-3">
            {matches.map((item, idx) => {
              const isSelected = selectedIndices.has(idx);
              const prod = item.recommended_product;
              const hasAlternatives = item.alternatives && item.alternatives.length > 0;
              const isExpanded = expandedAlternatives[idx];

              return (
                <motion.div
                  key={idx}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`p-4 sm:p-5 rounded-3xl bg-white border transition-all card-shadow ${
                    isSelected ? 'border-purple-200' : 'border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Select Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(idx)}
                      className="mt-1 w-5 h-5 accent-purple-600 rounded-md cursor-pointer shrink-0"
                    />

                    {/* Product Image */}
                    <img
                      src={prod?.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80'}
                      alt={prod?.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-slate-100 border border-slate-100 shrink-0"
                    />

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      {/* OCR Label & Confidence Badge */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          "{item.raw_item}"
                        </span>
                        
                        {item.confidence_badge === 'HIGH' && (
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            ✓ Matched
                          </span>
                        )}
                        {item.confidence_badge === 'MEDIUM' && (
                          <span className="text-[10px] font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                            ? Please confirm
                          </span>
                        )}
                        {item.confidence_badge === 'LOW' && (
                          <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            ⚠ Clarification needed
                          </span>
                        )}
                      </div>

                      {/* Product Name & Brand */}
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug truncate">
                        {prod?.name || item.item}
                      </h3>

                      {/* Pricing */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm sm:text-base font-black text-slate-900">
                          ₹{prod?.price || 0}
                        </span>
                        {prod?.original_price && prod.original_price > prod.price && (
                          <span className="text-xs text-slate-400 line-through font-semibold">
                            ₹{prod.original_price}
                          </span>
                        )}
                        <span className="text-[11px] font-bold text-slate-500">
                          • {prod?.pack_size || item.quantity} {prod?.unit || ''}
                        </span>
                      </div>

                      {/* AI Reason Explanation */}
                      {item.reason && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50/80 border border-purple-100 text-[11px] font-bold text-purple-800">
                          <Sparkles className="w-3 h-3 text-purple-600 shrink-0" />
                          <span>{item.reason}</span>
                        </div>
                      )}

                      {/* Ambiguous Item Resolution Bar if applicable */}
                      {item.is_ambiguous && (
                        <div className="mt-2 p-2 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2 text-xs">
                          <span className="font-bold text-amber-900">Confirm ambiguous request:</span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => setMatches((p) => {
                                const n = [...p];
                                n[idx].is_ambiguous = false;
                                n[idx].confidence_badge = 'HIGH';
                                return n;
                              })}
                              className="px-2 py-1 bg-amber-600 text-white font-extrabold text-[10px] rounded-lg"
                            >
                              Yes, add
                            </button>
                            {hasAlternatives && (
                              <button
                                onClick={() => setExpandedAlternatives((p) => ({ ...p, [idx]: !p[idx] }))}
                                className="px-2 py-1 bg-white border border-amber-300 text-amber-900 font-bold text-[10px] rounded-lg"
                              >
                                Choose product
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-2 bg-purple-50 p-1.5 rounded-2xl border border-purple-100 shrink-0">
                      <button
                        onClick={() => handleUpdateQty(idx, -1)}
                        className="w-7 h-7 rounded-xl bg-white text-purple-700 flex items-center justify-center font-bold hover:bg-purple-100 shadow-xs cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-black text-purple-950 w-5 text-center">
                        {item.quantity || 1}
                      </span>
                      <button
                        onClick={() => handleUpdateQty(idx, 1)}
                        className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold hover:bg-purple-700 shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Alternative Brand Switcher Toggle */}
                  {hasAlternatives && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setExpandedAlternatives((p) => ({ ...p, [idx]: !p[idx] }))}
                        className="flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3 text-purple-600" />
                        <span>View {item.alternatives.length} Alternative Brands / Sizes</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>

                      {/* Alternatives Accordion */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-2 mt-2 pt-2 border-t border-purple-50"
                          >
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                              AI Alternative Candidates:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {item.alternatives.map((alt, altIdx) => (
                                <div
                                  key={altIdx}
                                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-900 truncate">{alt.name}</p>
                                    <p className="text-[11px] font-extrabold text-purple-700">₹{alt.price} • {alt.brand}</p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleSwitchAlternative(idx, alt)}
                                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold rounded-xl shadow-xs shrink-0 cursor-pointer"
                                  >
                                    Switch
                                  </button>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Safety & Confirmation Banner */}
        <div className="p-4 rounded-3xl bg-purple-50/50 border border-purple-100 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0" />
          <p className="text-xs text-slate-600 font-medium">
            <span className="font-bold text-slate-900">Explicit Confirmation:</span> Clicking "Add to Cart" will populate your basket for review. No purchase will be made until you place your order at checkout.
          </p>
        </div>
      </main>

      {/* Floating Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {selectedCount} Items Selected
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                ₹{totalAmount}
              </span>
              {totalSavings > 0 && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Save ₹{totalSavings}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAdding || selectedCount === 0}
            className="py-4 px-6 sm:px-8 bg-purple-600 hover:bg-purple-700 active:scale-[0.99] disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-purple-600/30 flex items-center gap-2 cursor-pointer transition-all"
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Adding items to cart...</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add {selectedCount} Items to Cart</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
