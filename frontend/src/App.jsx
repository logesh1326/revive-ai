import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './store/AuthContext';
import { CartProvider } from './store/CartContext';
import { OrderProvider } from './store/OrderContext';

// Screens
import Splash from './screens/Splash';
import Login from './screens/Login';
import VerifyPhone from './screens/VerifyPhone';
import CustomerProfile from './screens/CustomerProfile';
import AddressSetup from './screens/AddressSetup';
import Home from './screens/Home';
import Search from './screens/Search';
import CategoryPage from './screens/CategoryPage';
import AIAssistant from './screens/AIAssistant';
import MenuScanner from './screens/MenuScanner';
import ScanGroceryList from './screens/ScanGroceryList';
import SmartCartReview from './screens/SmartCartReview';
import AiPreferences from './screens/AiPreferences';
import Cart from './screens/Cart';
import Checkout from './screens/Checkout';
import OrderSuccess from './screens/OrderSuccess';
import OrderTracking from './screens/OrderTracking';
import ProfilePage from './screens/ProfilePage';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-[#FAFAFC] text-slate-900 font-sans">
              <Routes>
                {/* Onboarding Flow */}
                <Route path="/" element={<Splash />} />
                <Route path="/login" element={<Login />} />
                <Route path="/verify-phone" element={<VerifyPhone />} />
                <Route path="/profile-setup" element={<CustomerProfile />} />
                <Route path="/address-setup" element={<AddressSetup />} />

                {/* Core Shopping & Intelligent AI Grocery Agent */}
                <Route path="/home" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/categories" element={<CategoryPage />} />
                <Route path="/category/:id" element={<CategoryPage />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/scan-grocery-list" element={<ScanGroceryList />} />
                <Route path="/smart-cart-review" element={<SmartCartReview />} />
                <Route path="/ai-preferences" element={<AiPreferences />} />
                <Route path="/menu-scanner" element={<MenuScanner />} />
                <Route path="/recipe-to-cart" element={<MenuScanner />} />
                
                {/* Cart, Checkout & Order Tracking */}
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/order-tracking/:id" element={<OrderTracking />} />
                <Route path="/order-tracking" element={<OrderTracking />} />

                {/* Customer Profile & Settings */}
                <Route path="/profile" element={<ProfilePage />} />

                {/* Catch-all redirect to Home */}
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </div>
          </BrowserRouter>
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  );
}
