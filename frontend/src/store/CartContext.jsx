import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS, SMART_SAVINGS_PAIRS } from '../data/mockData';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('revive_cart');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    // Default starter basket for instant delightful demo
    return [
      { ...PRODUCTS[0], quantity: 2 }, // Amul Milk x2
      { ...PRODUCTS[5], quantity: 1 }, // Britannia Bread x1
      { ...PRODUCTS[3], quantity: 1 }  // Farm Fresh Tomatoes x1
    ];
  });

  const [lastAddedId, setLastAddedId] = useState(null);

  useEffect(() => {
    localStorage.setItem('revive_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
    setLastAddedId(product.id);
    setTimeout(() => setLastAddedId(null), 1500);
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setItems((prev) => {
      return prev
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const addMultipleItems = (itemList) => {
    setItems((prev) => {
      const copy = [...prev];
      itemList.forEach((newItem) => {
        // Try to match with existing PRODUCTS or create clean product object
        const matched = PRODUCTS.find((p) =>
          p.name.toLowerCase().includes(newItem.name.toLowerCase().split(' ')[0])
        ) || {
          id: 'ai_' + Math.random().toString(36).substring(2, 9),
          name: newItem.name,
          price: newItem.price,
          originalPrice: newItem.originalPrice || Math.round(newItem.price * 1.15),
          quantity: newItem.qty || '1 unit',
          image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80',
          rating: 4.8,
          deliveryTime: '15-20 min'
        };

        const existingIdx = copy.findIndex((item) => item.id === matched.id || item.name === matched.name);
        if (existingIdx > -1) {
          copy[existingIdx].quantity += 1;
        } else {
          copy.push({ ...matched, quantity: 1 });
        }
      });
      return copy;
    });
  };

  const [coupon, setCoupon] = useState(() => {
    try {
      const savedCoupon = localStorage.getItem('revive_coupon');
      return savedCoupon ? JSON.parse(savedCoupon) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (coupon) {
      localStorage.setItem('revive_coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('revive_coupon');
    }
  }, [coupon]);

  const addBatchToCart = (batchItems) => {
    setItems((prev) => {
      const copy = [...prev];
      batchItems.forEach(({ product, qty = 1 }) => {
        if (!product) return;
        const prodId = product.id || product.sku;
        const existingIdx = copy.findIndex(
          (item) => item.id === prodId || (item.sku && item.sku === prodId) || item.name.toLowerCase() === product.name.toLowerCase()
        );
        if (existingIdx > -1) {
          copy[existingIdx] = {
            ...copy[existingIdx],
            quantity: (Number(copy[existingIdx].quantity) || 0) + (Number(qty) || 1),
          };
        } else {
          copy.push({
            id: prodId || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            sku: product.sku || prodId,
            name: product.name,
            brand: product.brand,
            category: product.category,
            price: Number(product.price) || 0,
            originalPrice: Number(product.originalPrice || product.original_price || product.price),
            unit: product.unit || product.pack_size || '1 pack',
            image: product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80',
            quantity: Number(qty) || 1,
          });
        }
      });
      return copy;
    });
  };

  const applyCoupon = (code) => {
    const clean = (code || '').trim().toUpperCase();
    if (clean === 'REVIVE50' || clean === 'FIRST50') {
      const c = { code: clean, discount: 50, label: '₹50 Flat Discount' };
      setCoupon(c);
      return { success: true, message: '🎉 ₹50 discount applied successfully!' };
    }
    if (clean === 'SUPER10') {
      const disc = Math.max(10, Math.round(subtotal * 0.1));
      const c = { code: clean, discount: disc, label: '10% Smart Savings' };
      setCoupon(c);
      return { success: true, message: '🎉 10% discount applied successfully!' };
    }
    return { success: false, message: 'Invalid promo code. Try REVIVE50 or SUPER10.' };
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const switchAndSave = (oldItemName, betterDealProduct) => {
    setItems((prev) => {
      const filtered = prev.filter(
        (item) => !item.name.toLowerCase().includes(oldItemName.toLowerCase().split(' ')[0])
      );
      return [...filtered, { ...betterDealProduct, quantity: 1 }];
    });
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
  };

  const getItemQuantity = (productId) => {
    const item = items.find((i) => i.id === productId || i.sku === productId);
    return item ? item.quantity : 0;
  };

  // Calculations
  const totalCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  const subtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);

  const totalOriginal = items.reduce((sum, item) => {
    const orig = Number(item.originalPrice || item.price) || 0;
    return sum + orig * (Number(item.quantity) || 0);
  }, 0);

  const productSavings = Math.max(0, totalOriginal - subtotal);
  const deliveryFee = subtotal >= 199 || subtotal === 0 ? 0 : 25;
  const platformFee = items.length > 0 ? 3 : 0;
  const couponDiscount = coupon ? Math.min(coupon.discount, subtotal) : 0;
  const grandTotal = Math.max(0, subtotal - couponDiscount + deliveryFee + platformFee);
  const totalSavings = productSavings + couponDiscount + (deliveryFee === 0 && subtotal > 0 ? 25 : 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        addBatchToCart,
        removeFromCart,
        updateQuantity,
        addMultipleItems,
        switchAndSave,
        clearCart,
        getItemQuantity,
        totalCount,
        subtotal,
        totalOriginal,
        productSavings,
        deliveryFee,
        platformFee,
        coupon,
        couponDiscount,
        applyCoupon,
        removeCoupon,
        grandTotal,
        totalSavings,
        lastAddedId
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
