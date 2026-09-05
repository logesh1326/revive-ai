export const CATEGORIES = [
  {
    id: 'vegetables',
    name: 'Vegetables',
    icon: '🥦',
    color: '#E8F5E9',
    textColor: '#2E7D32',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
    itemCount: '45+ items'
  },
  {
    id: 'fruits',
    name: 'Fresh Fruits',
    icon: '🍎',
    color: '#FFEBEE',
    textColor: '#C62828',
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80',
    itemCount: '30+ items'
  },
  {
    id: 'dairy',
    name: 'Dairy & Eggs',
    icon: '🥛',
    color: '#E3F2FD',
    textColor: '#1565C0',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=400&q=80',
    itemCount: '25+ items'
  },
  {
    id: 'bakery',
    name: 'Bakery & Bread',
    icon: '🍞',
    color: '#FFF3E0',
    textColor: '#E65100',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
    itemCount: '20+ items'
  },
  {
    id: 'staples',
    name: 'Atta, Rice & Dal',
    icon: '🍚',
    color: '#FFF8E1',
    textColor: '#F57F17',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
    itemCount: '60+ items'
  },
  {
    id: 'beverages',
    name: 'Drinks & Juices',
    icon: '🥤',
    color: '#F3E5F5',
    textColor: '#6A1B9A',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80',
    itemCount: '40+ items'
  },
  {
    id: 'snacks',
    name: 'Snacks & Munchies',
    icon: '🍪',
    color: '#FBE9E7',
    textColor: '#D84315',
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=400&q=80',
    itemCount: '50+ items'
  },
  {
    id: 'personal-care',
    name: 'Personal Care',
    icon: '🧴',
    color: '#E0F2F1',
    textColor: '#00695C',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
    itemCount: '35+ items'
  },
  {
    id: 'household',
    name: 'Cleaning & Home',
    icon: '🧹',
    color: '#ECEFF1',
    textColor: '#37474F',
    image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=400&q=80',
    itemCount: '28+ items'
  },
  {
    id: 'baby-care',
    name: 'Baby Care',
    icon: '👶',
    color: '#FCE4EC',
    textColor: '#AD1457',
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80',
    itemCount: '18+ items'
  }
];

export const PRODUCTS = [
  {
    id: 'prod_1',
    name: 'Amul Taaza Homogenised Toned Milk',
    brand: 'Amul',
    category: 'dairy',
    quantity: '1 L',
    price: 54,
    originalPrice: 58,
    discount: '7% OFF',
    rating: 4.8,
    ratingCount: '12.4k',
    deliveryTime: '15-20 min',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=500&q=80',
    badge: 'Bestseller',
    isDeal: true,
    isPopular: true,
    inStock: true,
    description: 'Fresh toned milk, rich in calcium and vitamin D.'
  },
  {
    id: 'prod_2',
    name: 'Aashirvaad Superior MP Sharbati Atta',
    brand: 'Aashirvaad',
    category: 'staples',
    quantity: '5 kg',
    price: 285,
    originalPrice: 320,
    discount: '11% OFF',
    rating: 4.7,
    ratingCount: '8.9k',
    deliveryTime: '20-25 min',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80',
    badge: 'Top Pick',
    isDeal: false,
    isPopular: true,
    inStock: true,
    description: '100% whole wheat atta made from MP Sharbati wheat grains.'
  },
  {
    id: 'prod_3',
    name: 'India Gate Super Basmati Rice',
    brand: 'India Gate',
    category: 'staples',
    quantity: '5 kg',
    price: 499,
    originalPrice: 590,
    discount: '15% OFF',
    rating: 4.6,
    ratingCount: '6.2k',
    deliveryTime: '20-30 min',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80',
    badge: '15% OFF',
    isDeal: true,
    isPopular: true,
    inStock: true,
    description: 'Aged long-grain aromatic Basmati rice perfect for biryani and daily meals.'
  },
  {
    id: 'prod_4',
    name: 'Fresh Farm Tomatoes (Hybrid)',
    brand: 'Farm Fresh',
    category: 'vegetables',
    quantity: '1 kg',
    price: 38,
    originalPrice: 48,
    discount: '20% OFF',
    rating: 4.5,
    ratingCount: '15.1k',
    deliveryTime: '12-18 min',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=80',
    badge: '20% OFF',
    isDeal: true,
    isPopular: true,
    inStock: true,
    description: 'Farm-fresh, juicy red tomatoes, naturally ripened and handpicked.'
  },
  {
    id: 'prod_5',
    name: 'Fresh Robusta Bananas',
    brand: 'Farm Fresh',
    category: 'fruits',
    quantity: '1 kg (~6 pcs)',
    price: 52,
    originalPrice: 62,
    discount: '16% OFF',
    rating: 4.7,
    ratingCount: '9.3k',
    deliveryTime: '15-20 min',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=500&q=80',
    badge: '16% OFF',
    isDeal: true,
    isPopular: true,
    inStock: true,
    description: 'Sweet, energy-packed yellow bananas sourced directly from certified orchards.'
  },
  {
    id: 'prod_6',
    name: 'Britannia 100% Whole Wheat Bread',
    brand: 'Britannia',
    category: 'bakery',
    quantity: '400 g',
    price: 45,
    originalPrice: 50,
    discount: '10% OFF',
    rating: 4.6,
    ratingCount: '7.8k',
    deliveryTime: '15-20 min',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80',
    badge: 'Daily Need',
    isDeal: false,
    isPopular: true,
    inStock: true,
    description: 'Soft whole wheat bread with dietary fiber. Zero trans fat.'
  },
  {
    id: 'prod_7',
    name: 'Fortune Sunlite Refined Sunflower Oil',
    brand: 'Fortune',
    category: 'staples',
    quantity: '1 L Pouch',
    price: 142,
    originalPrice: 165,
    discount: '14% OFF',
    rating: 4.8,
    ratingCount: '11.0k',
    deliveryTime: '20-25 min',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=500&q=80',
    badge: 'Save ₹23',
    isDeal: true,
    isPopular: false,
    inStock: true,
    description: 'Light and healthy sunflower cooking oil enriched with vitamins A & D.'
  },
  {
    id: 'prod_8',
    name: 'Tata Sampann Unpolished Toor Dal',
    brand: 'Tata Sampann',
    category: 'staples',
    quantity: '1 kg',
    price: 175,
    originalPrice: 195,
    discount: '10% OFF',
    rating: 4.7,
    ratingCount: '4.5k',
    deliveryTime: '20-25 min',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80',
    badge: 'Protein Rich',
    isDeal: false,
    isPopular: true,
    inStock: true,
    description: 'Unpolished pigeon peas dal retaining natural wholesome nutrition.'
  },
  {
    id: 'prod_9',
    name: 'Tata Salt Vacuum Evaporated Iodised',
    brand: 'Tata Salt',
    category: 'staples',
    quantity: '1 kg',
    price: 26,
    originalPrice: 28,
    discount: '7% OFF',
    rating: 4.9,
    ratingCount: '25.0k',
    deliveryTime: '15-20 min',
    image: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?auto=format&fit=crop&w=500&q=80',
    badge: 'Desh Ka Namak',
    isDeal: false,
    isPopular: true,
    inStock: true,
    description: 'Iodized vacuum evaporated salt for everyday balanced diet.'
  },
  {
    id: 'prod_10',
    name: 'Fresh Nashik Red Onions',
    brand: 'Farm Fresh',
    category: 'vegetables',
    quantity: '1 kg',
    price: 35,
    originalPrice: 45,
    discount: '22% OFF',
    rating: 4.4,
    ratingCount: '18.3k',
    deliveryTime: '12-18 min',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=500&q=80',
    badge: '22% OFF',
    isDeal: true,
    isPopular: true,
    inStock: true,
    description: 'Crisp, pungent red onions sourced from top Nashik farms.'
  },
  {
    id: 'prod_11',
    name: 'Fresh Farm Hybrid Potatoes',
    brand: 'Farm Fresh',
    category: 'vegetables',
    quantity: '1 kg',
    price: 30,
    originalPrice: 38,
    discount: '21% OFF',
    rating: 4.5,
    ratingCount: '14.0k',
    deliveryTime: '12-18 min',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=500&q=80',
    badge: '21% OFF',
    isDeal: true,
    isPopular: true,
    inStock: true,
    description: 'Firm and smooth potatoes, ideal for roasting, fries, and curries.'
  },
  {
    id: 'prod_12',
    name: 'Fresh Shimla Royal Delicious Apples',
    brand: 'Farm Fresh',
    category: 'fruits',
    quantity: '4 pcs (~600g)',
    price: 149,
    originalPrice: 180,
    discount: '17% OFF',
    rating: 4.6,
    ratingCount: '5.1k',
    deliveryTime: '15-20 min',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=500&q=80',
    badge: 'Crisp & Sweet',
    isDeal: true,
    isPopular: false,
    inStock: true,
    description: 'Sweet, crisp and juicy red apples from Shimla orchards.'
  },
  {
    id: 'prod_13',
    name: 'Amul Salted Pasteurized Butter',
    brand: 'Amul',
    category: 'dairy',
    quantity: '500 g',
    price: 275,
    originalPrice: 290,
    discount: '5% OFF',
    rating: 4.9,
    ratingCount: '19.8k',
    deliveryTime: '15-20 min',
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=500&q=80',
    badge: 'Utterly Butterly',
    isDeal: false,
    isPopular: true,
    inStock: true,
    description: 'Rich creamy butter made from pure milk fat.'
  },
  {
    id: 'prod_14',
    name: 'Tata Tea Gold Rich & Aromatic',
    brand: 'Tata Tea',
    category: 'beverages',
    quantity: '500 g',
    price: 295,
    originalPrice: 340,
    discount: '13% OFF',
    rating: 4.7,
    ratingCount: '8.4k',
    deliveryTime: '20-25 min',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=500&q=80',
    badge: '13% OFF',
    isDeal: true,
    isPopular: false,
    inStock: true,
    description: 'Exquisite tea blend with gently rolled aromatic long leaves.'
  },
  {
    id: 'prod_15',
    name: 'Amul Fresh Malai Paneer',
    brand: 'Amul',
    category: 'dairy',
    quantity: '200 g',
    price: 95,
    originalPrice: 105,
    discount: '9% OFF',
    rating: 4.8,
    ratingCount: '11.2k',
    deliveryTime: '15-20 min',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80',
    badge: 'High Protein',
    isDeal: false,
    isPopular: true,
    inStock: true,
    description: 'Soft and succulent paneer prepared from pure pasteurized milk.'
  },
  {
    id: 'prod_16',
    name: 'Fresh Farm Eggs (Pack of 12)',
    brand: 'Farm Fresh',
    category: 'dairy',
    quantity: '12 pcs',
    price: 96,
    originalPrice: 110,
    discount: '12% OFF',
    rating: 4.9,
    ratingCount: '18.4k',
    deliveryTime: '15-20 min',
    image: 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=500&q=80',
    badge: 'Farm Fresh',
    isDeal: true,
    isPopular: true,
    inStock: true,
    description: 'High protein fresh brown farm eggs rich in Omega-3.'
  }
];

export const SMART_SAVINGS_PAIRS = [
  {
    currentProduct: {
      name: 'Premium Royal Basmati Rice (5 kg)',
      price: 620,
      brand: 'Kohinoor'
    },
    betterDeal: {
      name: 'India Gate Super Basmati Rice (5 kg)',
      price: 499,
      savings: 121,
      brand: 'India Gate',
      rating: 4.6,
      reason: 'Identical long grain elongation and 2-year aging with ₹121 direct savings.'
    }
  },
  {
    currentProduct: {
      name: 'Organic Farm Fresh Tomatoes (1 kg)',
      price: 65,
      brand: 'Nature First'
    },
    betterDeal: {
      name: 'Fresh Farm Tomatoes Hybrid (1 kg)',
      price: 38,
      savings: 27,
      brand: 'Farm Fresh',
      rating: 4.5,
      reason: 'Harvested today from local farms at 40% lower cost.'
    }
  }
];

export const PROMO_HEROES = [
  {
    id: 1,
    title: 'Fresh Picks Festival',
    subtitle: 'Crisp vegetables & juicy fruits at up to 30% OFF',
    cta: 'Shop Fresh',
    tag: '⚡ 15 MIN DELIVERY',
    gradient: 'from-purple-600 via-indigo-600 to-purple-800',
    bgBadge: '30% OFF',
    icon: '🥦'
  },
  {
    id: 2,
    title: 'Smart Grocery Week',
    subtitle: 'ReviveAI found ₹350+ savings across monthly staples',
    cta: 'View AI Deals',
    tag: '✨ AI AUTO-OPTIMIZED',
    gradient: 'from-purple-700 via-fuchsia-600 to-indigo-700',
    bgBadge: '₹350 SAVED',
    icon: '⚡'
  },
  {
    id: 3,
    title: 'Dairy & Breakfast Rush',
    subtitle: 'Fresh milk, whole wheat breads, farm eggs delivered before 7 AM',
    cta: 'Order Now',
    tag: '🥛 MORNING ESSENTIALS',
    gradient: 'from-indigo-600 via-purple-600 to-pink-600',
    bgBadge: 'FRESH TODAY',
    icon: '🥛'
  }
];

export const MOCK_USER = {
  name: 'Rahul Sharma',
  email: 'rahul.sharma@gmail.com',
  phone: '+91 98765 43210',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  defaultAddress: {
    id: 'addr_1',
    type: 'Home',
    building: 'Flat 402, Green Glen Heights',
    area: 'Outer Ring Road, T. Nagar',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600017',
    isDefault: true
  },
  savedAddresses: [
    {
      id: 'addr_1',
      type: 'Home',
      building: 'Flat 402, Green Glen Heights',
      area: 'Outer Ring Road, T. Nagar',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600017',
      isDefault: true
    },
    {
      id: 'addr_2',
      type: 'Work',
      building: 'DLF Cybercity, 4th Floor',
      area: 'Ramapuram, Mount Poonamallee Rd',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600089',
      isDefault: false
    }
  ]
};

export const AI_SAMPLE_BASKETS = {
  'family_weekly': {
    title: 'Family of 4 — Weekly Smart Essentials Basket',
    targetBudget: 2000,
    estimatedTotal: 1764,
    savings: 236,
    items: [
      { name: 'India Gate Super Basmati Rice (5 kg)', qty: '1 pack', price: 499, originalPrice: 590 },
      { name: 'Aashirvaad Sharbati Atta (5 kg)', qty: '1 pack', price: 285, originalPrice: 320 },
      { name: 'Amul Taaza Milk (1L)', qty: '4 packs', price: 216, originalPrice: 232 },
      { name: 'Farm Fresh Tomatoes + Onions + Potatoes (3 kg combo)', qty: '1 set', price: 103, originalPrice: 131 },
      { name: 'Tata Sampann Toor Dal (1 kg)', qty: '1 pack', price: 175, originalPrice: 195 },
      { name: 'Fortune Sunflower Oil (1L)', qty: '1 pouch', price: 142, originalPrice: 165 },
      { name: 'Britannia Whole Wheat Bread (400g)', qty: '2 packs', price: 90, originalPrice: 100 },
      { name: 'Fresh Robusta Bananas + Shimla Apples', qty: '1 basket', price: 201, originalPrice: 242 },
      { name: 'Tata Salt Vacuum Iodised (1 kg)', qty: '2 packs', price: 52, originalPrice: 56 }
    ]
  },
  'healthy_snacks': {
    title: 'Healthy Snack Box under ₹500',
    targetBudget: 500,
    estimatedTotal: 445,
    savings: 85,
    items: [
      { name: 'Amul Fresh Malai Paneer (200g)', qty: '1 pack', price: 95, originalPrice: 105 },
      { name: 'Fresh Shimla Royal Apples (4 pcs)', qty: '1 box', price: 149, originalPrice: 180 },
      { name: 'Fresh Robusta Bananas (1 kg)', qty: '1 kg', price: 52, originalPrice: 62 },
      { name: 'Tata Tea Gold Aromatic (250g)', qty: '1 pack', price: 154, originalPrice: 188 }
    ]
  }
};
