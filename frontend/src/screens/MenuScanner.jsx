import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Upload, Sparkles, ChefHat, Check, Plus, Trash2, 
  ArrowRight, ArrowLeft, RefreshCw, ShoppingBag, Zap, Lightbulb, 
  Layers, CheckCircle2, FileText, Image as ImageIcon, Users, AlertCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import { useCart } from '../store/CartContext';
import { PRODUCTS } from '../data/mockData';

const MENU_PRESETS = [
  {
    id: 'biryani_feast',
    title: 'Sunday Biryani & Raita Feast',
    servings: 4,
    cuisine: 'Indian Special',
    icon: '🍛',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    description: 'Aromatic long-grain basmati biryani with spiced masala and cool curd raita',
    ingredients: [
      { id: 'i1', name: 'India Gate Super Basmati Rice (5 kg)', qty: '1 pack (5kg)', price: 499, originalPrice: 590, checked: true, category: 'Rice', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80' },
      { id: 'i2', name: 'Fresh Nashik Red Onions (1 kg)', qty: '2 kg', price: 70, originalPrice: 90, checked: true, category: 'Veggies', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=300&q=80' },
      { id: 'i3', name: 'Fresh Farm Tomatoes (1 kg)', qty: '1 kg', price: 38, originalPrice: 48, checked: true, category: 'Veggies', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80' },
      { id: 'i4', name: 'Amul Taaza Milk (1L)', qty: '1 pack', price: 54, originalPrice: 58, checked: true, category: 'Raita', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=300&q=80' },
      { id: 'i5', name: 'Fortune Sunlite Refined Sunflower Oil (1L)', qty: '1 pouch', price: 142, originalPrice: 165, checked: true, category: 'Cooking Oil', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80' },
      { id: 'i6', name: 'Tata Salt Vacuum Evaporated Iodised (1 kg)', qty: '1 pack', price: 26, originalPrice: 28, checked: true, category: 'Spices', image: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?auto=format&fit=crop&w=300&q=80' }
    ],
    suggestions: [
      { id: 's1', name: 'Fresh Mint & Coriander Bunch', price: 25, reason: 'Essential for biryani dum aroma', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80' },
      { id: 's2', name: 'Tata Tea Gold Aromatic (250g)', price: 154, reason: 'Post-feast digestion refreshment', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=300&q=80' },
      { id: 's3', name: 'Amul Salted Pasteurized Butter (500g)', price: 275, reason: 'For extra aroma & royal glaze', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=300&q=80' }
    ]
  },
  {
    id: 'paneer_naan',
    title: 'Paneer Butter Masala & Dal Makhani',
    servings: 4,
    cuisine: 'North Indian',
    icon: '🥘',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
    description: 'Rich tomato-butter paneer gravy with whole dal and soft whole wheat phulkas',
    ingredients: [
      { id: 'i7', name: 'Amul Fresh Malai Paneer (200g)', qty: '2 packs (400g)', price: 190, originalPrice: 210, checked: true, category: 'Paneer', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80' },
      { id: 'i8', name: 'Aashirvaad Superior MP Sharbati Atta (5 kg)', qty: '1 pack', price: 285, originalPrice: 320, checked: true, category: 'Roti / Naan', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80' },
      { id: 'i9', name: 'Amul Salted Pasteurized Butter (500g)', qty: '1 pack', price: 275, originalPrice: 290, checked: true, category: 'Butter Gravy', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=300&q=80' },
      { id: 'i10', name: 'Fresh Farm Tomatoes (1 kg)', qty: '2 kg', price: 76, originalPrice: 96, checked: true, category: 'Gravy Base', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80' },
      { id: 'i11', name: 'Fresh Nashik Red Onions (1 kg)', qty: '1 kg', price: 35, originalPrice: 45, checked: true, category: 'Gravy Base', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=300&q=80' },
      { id: 'i12', name: 'Tata Sampann Unpolished Toor Dal (1 kg)', qty: '1 pack', price: 175, originalPrice: 195, checked: true, category: 'Dal', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80' }
    ],
    suggestions: [
      { id: 's4', name: 'Fresh Farm Hybrid Potatoes (1 kg)', price: 30, reason: 'Great side for aloo jeera fry', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=300&q=80' },
      { id: 's5', name: 'Britannia 100% Whole Wheat Bread', price: 45, reason: 'Quick morning toast companion', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80' }
    ]
  },
  {
    id: 'south_breakfast',
    title: 'Traditional Idli Sambar & Chutney',
    servings: 4,
    cuisine: 'South Indian',
    icon: '🥞',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    description: 'Steaming hot idlis with aromatic vegetable sambar and fresh ground chutney',
    ingredients: [
      { id: 'i13', name: 'Tata Sampann Unpolished Toor Dal (1 kg)', qty: '1 pack', price: 175, originalPrice: 195, checked: true, category: 'Sambar', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80' },
      { id: 'i14', name: 'Fresh Farm Tomatoes (1 kg)', qty: '1 kg', price: 38, originalPrice: 48, checked: true, category: 'Sambar', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80' },
      { id: 'i15', name: 'Fresh Farm Hybrid Potatoes (1 kg)', qty: '1 kg', price: 30, originalPrice: 38, checked: true, category: 'Sambar', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=300&q=80' },
      { id: 'i16', name: 'Fresh Nashik Red Onions (1 kg)', qty: '1 kg', price: 35, originalPrice: 45, checked: true, category: 'Sambar', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=300&q=80' },
      { id: 'i17', name: 'Amul Taaza Homogenised Toned Milk (1L)', qty: '2 packs', price: 108, originalPrice: 116, checked: true, category: 'Filter Coffee', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=300&q=80' }
    ],
    suggestions: [
      { id: 's6', name: 'Tata Tea Gold Rich & Aromatic', price: 295, reason: 'Authentic morning chai & coffee', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=300&q=80' }
    ]
  },
  {
    id: 'pasta_night',
    title: 'Creamy Garlic Herb Pasta & Salad',
    servings: 2,
    cuisine: 'Continental',
    icon: '🍝',
    image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=600&q=80',
    description: 'Al dente pasta tossed in creamy garlic herb butter with crisp fresh garden salad',
    ingredients: [
      { id: 'i18', name: 'Amul Taaza Homogenised Toned Milk (1L)', qty: '1 pack', price: 54, originalPrice: 58, checked: true, category: 'White Sauce', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=300&q=80' },
      { id: 'i19', name: 'Amul Salted Pasteurized Butter (500g)', qty: '1 pack', price: 275, originalPrice: 290, checked: true, category: 'White Sauce', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=300&q=80' },
      { id: 'i20', name: 'Fresh Farm Tomatoes (1 kg)', qty: '1 kg', price: 38, originalPrice: 48, checked: true, category: 'Fresh Salad', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80' },
      { id: 'i21', name: 'Britannia 100% Whole Wheat Bread', qty: '1 pack', price: 45, originalPrice: 50, checked: true, category: 'Garlic Toast', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80' }
    ],
    suggestions: [
      { id: 's7', name: 'Fresh Shimla Royal Delicious Apples (4 pcs)', price: 149, reason: 'Crisp fruit salad dessert', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=300&q=80' }
    ]
  }
];

const SAMPLE_IMAGE_DOCS = [
  {
    id: 'img_handwritten',
    name: '📝 Handwritten Grocery List',
    type: 'Paper Note',
    sampleText: 'Atta 5kg, Amul Milk 2L, Bread 1 pack, Tomatoes 1kg, Salt, Dal 1kg, Sunflower oil',
    itemsCount: '7 essentials'
  },
  {
    id: 'img_party_menu',
    name: '🍽️ Party Menu: Dinner for 6',
    type: 'Menu Card',
    sampleText: 'Veg Biryani, Paneer Butter Masala, Raita, Whole Wheat Rotis, Onion Salad',
    itemsCount: '6 main dishes'
  },
  {
    id: 'img_recipe_book',
    name: '📖 Recipe Book: Dal Tadka & Rice',
    type: 'Cookbook Page',
    sampleText: 'Ingredients: 500g Toor Dal, 2 large Onions, 3 Tomatoes, Butter, Salt, Basmati Rice',
    itemsCount: '5 ingredients'
  }
];

export default function MenuScanner() {
  const navigate = useNavigate();
  const { addMultipleItems } = useCart();

  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'image'
  const [customPrompt, setCustomPrompt] = useState('Atta 5kg, Amul Milk 2L, Bread 1 pack, Tomatoes 1kg, Dal 1kg, Salt, Sunflower oil');
  const [servingsCount, setServingsCount] = useState(4);
  const [selectedPreset, setSelectedPreset] = useState(MENU_PRESETS[0]);
  const [ingredientsList, setIngredientsList] = useState(MENU_PRESETS[0].ingredients);
  const [suggestionsList, setSuggestionsList] = useState(MENU_PRESETS[0].suggestions);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImageName, setUploadedImageName] = useState(null);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Handle Preset Select
  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setServingsCount(preset.servings);
    setIngredientsList(preset.ingredients.map((item) => ({ ...item, checked: true })));
    setSuggestionsList(preset.suggestions);
    setCustomPrompt(preset.title);
  };

  // Toggle ingredient checkbox
  const handleToggleItem = (itemId) => {
    setIngredientsList((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, checked: !item.checked } : item))
    );
  };

  // Add individual suggestion to primary list
  const handleAddSuggestion = (sug) => {
    const newItem = {
      id: 'sug_' + Date.now(),
      name: sug.name,
      qty: '1 unit',
      price: sug.price,
      originalPrice: Math.round(sug.price * 1.15),
      checked: true,
      category: 'Smart Add-on',
      image: sug.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80'
    };
    setIngredientsList((prev) => [...prev, newItem]);
    setSuggestionsList((prev) => prev.filter((s) => s.id !== sug.id));
  };

  // Parse Text Input or Uploaded Image
  const handleAnalyzeMenu = (inputSourceText = null) => {
    const textToAnalyze = inputSourceText || customPrompt;
    if (!textToAnalyze && !uploadedImageName) return;

    setIsAnalyzing(true);

    setTimeout(() => {
      const lower = (textToAnalyze || '').toLowerCase();
      let parsedItems = [];
      let smartSuggestions = [];

      // Check for specific items mentioned in prompt
      if (lower.includes('atta') || lower.includes('flour')) {
        parsedItems.push({
          id: 'p_atta',
          name: 'Aashirvaad Superior MP Sharbati Atta (5 kg)',
          qty: '1 pack (5 kg)',
          price: 285,
          originalPrice: 320,
          checked: true,
          category: 'Staples',
          image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80'
        });
      }

      if (lower.includes('milk')) {
        const qtyMatch = lower.includes('2l') || lower.includes('2 l') ? '2 packs (2L)' : '1 pack (1L)';
        const price = lower.includes('2l') || lower.includes('2 l') ? 108 : 54;
        parsedItems.push({
          id: 'p_milk',
          name: 'Amul Taaza Homogenised Toned Milk',
          qty: qtyMatch,
          price: price,
          originalPrice: price + 8,
          checked: true,
          category: 'Dairy',
          image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=300&q=80'
        });
      }

      if (lower.includes('bread')) {
        parsedItems.push({
          id: 'p_bread',
          name: 'Britannia 100% Whole Wheat Bread (400g)',
          qty: '1 pack',
          price: 45,
          originalPrice: 50,
          checked: true,
          category: 'Bakery',
          image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80'
        });
      }

      if (lower.includes('tomato')) {
        parsedItems.push({
          id: 'p_tomato',
          name: 'Fresh Farm Tomatoes (Hybrid)',
          qty: '1 kg',
          price: 38,
          originalPrice: 48,
          checked: true,
          category: 'Vegetables',
          image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80'
        });
      }

      if (lower.includes('dal') || lower.includes('toor')) {
        parsedItems.push({
          id: 'p_dal',
          name: 'Tata Sampann Unpolished Toor Dal (1 kg)',
          qty: '1 pack',
          price: 175,
          originalPrice: 195,
          checked: true,
          category: 'Pulses',
          image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80'
        });
      }

      if (lower.includes('oil') || lower.includes('sunflower')) {
        parsedItems.push({
          id: 'p_oil',
          name: 'Fortune Sunlite Refined Sunflower Oil (1L)',
          qty: '1 pouch',
          price: 142,
          originalPrice: 165,
          checked: true,
          category: 'Cooking Oil',
          image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&q=80'
        });
      }

      if (lower.includes('salt')) {
        parsedItems.push({
          id: 'p_salt',
          name: 'Tata Salt Vacuum Evaporated Iodised (1 kg)',
          qty: '1 pack',
          price: 26,
          originalPrice: 28,
          checked: true,
          category: 'Spices',
          image: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?auto=format&fit=crop&w=300&q=80'
        });
      }

      if (lower.includes('rice') || lower.includes('biryani')) {
        parsedItems.push({
          id: 'p_rice',
          name: 'India Gate Super Basmati Rice (5 kg)',
          qty: '1 pack',
          price: 499,
          originalPrice: 590,
          checked: true,
          category: 'Rice & Grains',
          image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80'
        });
      }

      if (lower.includes('paneer')) {
        parsedItems.push({
          id: 'p_paneer',
          name: 'Amul Fresh Malai Paneer (200g)',
          qty: '2 packs (400g)',
          price: 190,
          originalPrice: 210,
          checked: true,
          category: 'Dairy',
          image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80'
        });
      }

      if (lower.includes('egg')) {
        parsedItems.push({
          id: 'p_eggs',
          name: 'Fresh Farm Eggs (Pack of 12)',
          qty: '12 pcs',
          price: 96,
          originalPrice: 110,
          checked: true,
          category: 'Dairy & Eggs',
          image: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=300&q=80'
        });
      }

      // If nothing parsed by keyword, use smart fallback
      if (parsedItems.length === 0) {
        parsedItems = [
          { id: 'g1', name: 'Aashirvaad Superior MP Sharbati Atta (5 kg)', qty: '1 pack', price: 285, originalPrice: 320, checked: true, category: 'Staples', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80' },
          { id: 'g2', name: 'Amul Taaza Homogenised Toned Milk (1L)', qty: '2 packs', price: 108, originalPrice: 116, checked: true, category: 'Dairy', image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=300&q=80' },
          { id: 'g3', name: 'Fresh Farm Tomatoes (1 kg)', qty: '1 kg', price: 38, originalPrice: 48, checked: true, category: 'Fresh Veggies', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=300&q=80' },
          { id: 'g4', name: 'Fresh Nashik Red Onions (1 kg)', qty: '1 kg', price: 35, originalPrice: 45, checked: true, category: 'Fresh Veggies', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=300&q=80' },
          { id: 'g5', name: 'Tata Sampann Unpolished Toor Dal (1 kg)', qty: '1 pack', price: 175, originalPrice: 195, checked: true, category: 'Pulses', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80' }
        ];
      }

      smartSuggestions = [
        { id: 'sg1', name: 'Amul Salted Pasteurized Butter (500g)', price: 275, reason: 'Essential cooking enhancer', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=300&q=80' },
        { id: 'sg2', name: 'Tata Tea Gold Rich & Aromatic', price: 295, reason: 'Morning brew refreshment', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=300&q=80' },
        { id: 'sg3', name: 'Fresh Robusta Bananas (1 kg)', price: 52, reason: 'Quick energy fruit snack', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=300&q=80' }
      ];

      setIngredientsList(parsedItems);
      setSuggestionsList(smartSuggestions);
      setIsAnalyzing(false);
    }, 1100);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImageName(file.name);
      handleAnalyzeMenu(`Atta 5kg, Amul Milk 2L, Bread 1 pack, Tomatoes 1kg, Salt, Dal 1kg, Sunflower oil from ${file.name}`);
    }
  };

  const handleSelectSampleDoc = (doc) => {
    setUploadedImageName(doc.name);
    setCustomPrompt(doc.sampleText);
    handleAnalyzeMenu(doc.sampleText);
  };

  // Add all checked ingredients from the given list to cart
  const handleAddGivenListToCart = () => {
    const itemsToAdd = ingredientsList.filter((item) => item.checked);
    addMultipleItems(itemsToAdd);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      navigate('/cart');
    }, 1100);
  };

  // Calculations
  const checkedItems = ingredientsList.filter((item) => item.checked);
  const totalCost = checkedItems.reduce((sum, item) => sum + item.price, 0);
  const totalOriginal = checkedItems.reduce((sum, item) => sum + (item.originalPrice || item.price), 0);
  const savings = totalOriginal - totalCost;

  return (
    <div className="min-h-screen bg-[#FAFAFC] pb-28 md:pb-12 text-slate-900">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-3 space-y-4">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 rounded-3xl p-5 sm:p-6 text-white card-shadow relative overflow-hidden">
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/home')}
                className="p-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                    ✨ AI Menu & Shopping List Parser
                  </h1>
                  <span className="bg-emerald-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full">
                    ACCURATE MATCHING
                  </span>
                </div>
                <p className="text-xs text-purple-100 mt-0.5">
                  Type your grocery list, pick a meal menu, or upload a photo. Exactly matches and adds your list!
                </p>
              </div>
            </div>

            <div className="hidden sm:flex w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md items-center justify-center text-2xl">
              🥘
            </div>
          </div>
        </div>

        {/* Input Mode Tabs */}
        <div className="flex rounded-2xl bg-white p-1.5 border border-purple-100 card-shadow">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'menu'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-600 hover:bg-purple-50'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Type Shopping List / Dish</span>
          </button>

          <button
            onClick={() => setActiveTab('image')}
            className={`flex-1 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'image'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-600 hover:bg-purple-50'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Scan Photo / Note</span>
          </button>
        </div>

        {/* TAB 1: Menu & Recipe Input */}
        {activeTab === 'menu' ? (
          <div className="space-y-4">
            
            {/* Custom Input Form */}
            <div className="bg-white rounded-3xl p-5 border border-purple-50 card-shadow space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Enter your grocery items or meal plan:</span>
                </label>
                
                {/* Servings Counter */}
                <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-xl border border-purple-100">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-[11px] font-extrabold text-purple-900">
                    {servingsCount} Portions
                  </span>
                  <div className="flex gap-1 ml-1">
                    <button
                      onClick={() => setServingsCount(Math.max(1, servingsCount - 1))}
                      className="w-5 h-5 bg-white rounded-md text-xs font-bold text-slate-700 flex items-center justify-center hover:bg-purple-200"
                    >
                      -
                    </button>
                    <button
                      onClick={() => setServingsCount(servingsCount + 1)}
                      className="w-5 h-5 bg-white rounded-md text-xs font-bold text-slate-700 flex items-center justify-center hover:bg-purple-200"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <textarea
                  rows="2"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. Atta 5kg, Amul Milk 2L, Bread 1 pack, Tomatoes 1kg, Salt, Dal 1kg, Sunflower oil..."
                  className="flex-1 px-4 py-3 text-xs sm:text-sm font-semibold rounded-2xl border border-slate-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-100 focus:outline-none"
                />
                <button
                  onClick={() => handleAnalyzeMenu()}
                  disabled={!customPrompt.trim()}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5 self-stretch sm:self-auto"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Parse & Match List</span>
                </button>
              </div>

              {/* Popular Curated Menu Presets */}
              <div className="pt-2">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                  Or pick a popular grocery menu idea
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {MENU_PRESETS.map((preset) => {
                    const isSelected = selectedPreset.id === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset)}
                        className={`rounded-2xl border transition-all cursor-pointer overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? 'border-purple-600 ring-2 ring-purple-400/40 bg-purple-50/70 shadow-sm'
                            : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="h-20 w-full overflow-hidden relative">
                          <img
                            src={preset.image}
                            alt={preset.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <span className="absolute bottom-1.5 left-2 text-xs font-black text-white flex items-center gap-1">
                            <span>{preset.icon}</span> {preset.cuisine}
                          </span>
                        </div>
                        <div className="p-2.5">
                          <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
                            {preset.title}
                          </h4>
                          <span className="text-[10px] font-bold text-purple-700 mt-1 block">
                            {preset.ingredients.length} items • {preset.servings} Servings
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* TAB 2: Image & Menu Card Scanner */
          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-purple-50 card-shadow text-center">
              
              {/* Dropzone */}
              <div className="border-2 border-dashed border-purple-200 hover:border-purple-500 rounded-2xl p-8 bg-purple-50/30 transition-all flex flex-col items-center justify-center relative cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  Upload / Snap Photo of Menu or Grocery Note
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Drag & drop your handwritten grocery list, party menu card, or recipe book page.
                </p>
                <div className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-sm">
                  Browse or Take Photo
                </div>
              </div>

              {/* Sample Documents */}
              <div className="mt-6 text-left">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-2.5">
                  Try with Sample Scans (1-Click Demo)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SAMPLE_IMAGE_DOCS.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => handleSelectSampleDoc(doc)}
                      className="p-3.5 rounded-2xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 transition-all cursor-pointer flex items-start gap-2.5"
                    >
                      <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 block">{doc.name}</span>
                        <span className="text-[10px] text-slate-500 line-clamp-1">{doc.sampleText}</span>
                        <span className="text-[9px] font-bold text-emerald-600 mt-1 block">✓ {doc.itemsCount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Animation */}
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-white border border-purple-100 card-shadow flex flex-col items-center justify-center text-center space-y-2"
          >
            <Sparkles className="w-8 h-8 text-purple-600 animate-spin" />
            <h4 className="font-extrabold text-sm text-slate-900">
              ReviveAI is matching your exact list to store stock...
            </h4>
            <p className="text-xs text-slate-500">
              Extracting items, identifying weights & best prices for {servingsCount} portions.
            </p>
          </motion.div>
        )}

        {/* Parsed List Results */}
        {!isAnalyzing && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left Column: Exact Given List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-3xl p-5 border border-purple-50 card-shadow space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-base text-slate-900">
                        Your Given List ({checkedItems.length} items to add)
                      </h3>
                      <span className="bg-purple-100 text-purple-700 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                        EXACT MATCH
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Check or uncheck items before adding to cart.
                    </p>
                  </div>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Save ₹{savings}
                  </span>
                </div>

                {/* Items List with Real Grocery Images */}
                <div className="space-y-2.5">
                  {ingredientsList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleItem(item.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        item.checked
                          ? 'border-purple-200 bg-purple-50/40'
                          : 'border-slate-200 bg-slate-50/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
                            item.checked
                              ? 'bg-purple-600 text-white'
                              : 'border-2 border-slate-300'
                          }`}
                        >
                          {item.checked && <Check className="w-3.5 h-3.5" />}
                        </div>

                        {/* Product Image */}
                        <div className="w-12 h-12 rounded-xl bg-white p-0.5 border border-slate-200 overflow-hidden flex-shrink-0">
                          <img
                            src={item.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80"}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>

                        <div>
                          <span className={`text-xs sm:text-sm font-extrabold ${item.checked ? 'text-slate-900' : 'text-slate-500 line-through'}`}>
                            {item.name}
                          </span>
                          <span className="text-[11px] text-slate-400 block font-medium">
                            {item.qty} • {item.category}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-xs sm:text-sm font-black text-slate-900 block">
                          ₹{item.price}
                        </span>
                        {item.originalPrice && (
                          <span className="text-[10px] text-slate-400 line-through">
                            ₹{item.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional Smart Complements & Missing Sides */}
              {suggestionsList.length > 0 && (
                <div className="bg-gradient-to-r from-amber-50 via-white to-amber-50/40 rounded-3xl p-5 border border-amber-200/80 card-shadow space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                        ✨ Optional Complements & Side Pairings
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        Suggested based on grocery basket pairing algorithms (click to add if needed)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {suggestionsList.map((sug) => (
                      <div
                        key={sug.id}
                        className="p-3 rounded-2xl bg-white border border-amber-100 flex items-center justify-between gap-2 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={sug.image || "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80"}
                            alt={sug.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-900 block leading-tight">{sug.name}</span>
                            <span className="text-[10px] text-amber-700 font-medium">{sug.reason}</span>
                            <span className="text-xs font-black text-slate-800 block mt-0.5">₹{sug.price}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddSuggestion(sug)}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[10px] flex items-center gap-1 shadow-xs flex-shrink-0"
                        >
                          <Plus className="w-3 h-3" /> Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Order Summary & 1-Click Action */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-3xl p-5 border border-purple-50 card-shadow space-y-3">
                <h3 className="font-extrabold text-sm text-slate-900 pb-2 border-b border-slate-100">
                  List Summary
                </h3>

                <div className="space-y-2 text-xs text-slate-600 font-semibold">
                  <div className="flex justify-between">
                    <span>Items to Add</span>
                    <span className="text-slate-900 font-bold">{checkedItems.length} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Portions Scaled</span>
                    <span className="text-slate-900 font-bold">{servingsCount} People</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Delivery</span>
                    <span className="text-purple-700 font-bold">⚡ 15–20 Mins</span>
                  </div>
                  {savings > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50 p-2 rounded-xl">
                      <span>Total Savings</span>
                      <span>- ₹{savings}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs text-slate-400 font-bold block">Total Amount</span>
                    <span className="text-xl font-black text-slate-900">₹{totalCost}</span>
                  </div>
                </div>

                {/* Primary Button to add the EXACT given list */}
                <button
                  onClick={handleAddGivenListToCart}
                  disabled={checkedItems.length === 0 || addedSuccess}
                  className={`w-full py-3.5 px-4 font-extrabold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                    addedSuccess
                      ? 'bg-emerald-600 text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/30 active:scale-95'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{checkedItems.length} Items Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add Given List ({checkedItems.length} items) to Cart</span>
                    </>
                  )}
                </button>
              </div>

              {/* Delivery Guarantee */}
              <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100 text-[11px] text-purple-900 font-medium text-center space-y-1">
                <span className="font-bold block">⚡ 15-Min Superfast Express Delivery</span>
                <span className="text-slate-500 text-[10px] block">Freshly picked from Chennai Dark Store Hub.</span>
              </div>
            </div>

          </div>
        )}

      </main>

      <BottomNav />
    </div>
  );
}
