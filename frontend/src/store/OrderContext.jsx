import React, { createContext, useContext, useState, useEffect } from 'react';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('revive_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [
      {
        id: 'RV-10284',
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        items: [
          { name: 'Amul Taaza Milk (1L)', quantity: 2, price: 54 },
          { name: 'Britannia 100% Whole Wheat Bread', quantity: 1, price: 45 },
          { name: 'Fresh Farm Tomatoes (1 kg)', quantity: 1, price: 38 }
        ],
        totalAmount: 191,
        totalSavings: 35,
        paymentMethod: 'UPI',
        status: 'Delivered',
        deliveryAddress: 'Flat 402, Green Glen Heights, Chennai',
        etaMinutes: 0
      }
    ];
  });

  const [activeOrder, setActiveOrder] = useState(() => {
    const saved = localStorage.getItem('revive_active_order');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('revive_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('revive_active_order', JSON.stringify(activeOrder));
  }, [activeOrder]);

  const placeOrder = ({ items, subtotal, grandTotal, totalSavings, address, paymentMethod }) => {
    const newOrderId = `RV-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder = {
      id: newOrderId,
      createdAt: new Date().toISOString(),
      items: items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      })),
      totalAmount: grandTotal,
      subtotal,
      totalSavings,
      paymentMethod,
      status: 'Order Confirmed',
      deliveryAddress: `${address.building}, ${address.area}, ${address.city}`,
      deliveryPartner: {
        name: 'Ramesh Kumar',
        phone: '+91 98401 23456',
        rating: 4.9,
        trips: '1,420 orders delivered',
        vehicleNumber: 'TN 07 CB 4412'
      },
      stageIndex: 0, // 0: Confirmed, 1: Packing, 2: Picked Up, 3: Out for Delivery, 4: Delivered
      etaMinutes: 22
    };

    setOrders((prev) => [newOrder, ...prev]);
    setActiveOrder(newOrder);
    return newOrder;
  };

  const advanceOrderStatus = (orderId, nextStageIndex) => {
    const stages = ['Order Confirmed', 'Packing your groceries', 'Picked up from dark store', 'Out for delivery', 'Delivered! 🎉'];
    const newStatus = stages[nextStageIndex] || 'Delivered';

    setActiveOrder((prev) => {
      if (prev && prev.id === orderId) {
        return {
          ...prev,
          stageIndex: nextStageIndex,
          status: newStatus,
          etaMinutes: Math.max(0, 22 - nextStageIndex * 6)
        };
      }
      return prev;
    });

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              stageIndex: nextStageIndex,
              status: newStatus,
              etaMinutes: Math.max(0, 22 - nextStageIndex * 6)
            }
          : o
      )
    );
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        activeOrder,
        placeOrder,
        advanceOrderStatus,
        setActiveOrder
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
