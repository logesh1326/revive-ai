import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';
import { MOCK_USER } from '../data/mockData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('revive_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentAddress, setCurrentAddress] = useState(() => {
    const saved = localStorage.getItem('revive_address');
    return saved ? JSON.parse(saved) : null;
  });

  const [addresses, setAddresses] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('revive_auth') === 'true';
  });

  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Sync state with local cache
  useEffect(() => {
    if (user) {
      localStorage.setItem('revive_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('revive_user');
    }
  }, [user]);

  useEffect(() => {
    if (currentAddress) {
      localStorage.setItem('revive_address', JSON.stringify(currentAddress));
    } else {
      localStorage.removeItem('revive_address');
    }
  }, [currentAddress]);

  useEffect(() => {
    localStorage.setItem('revive_auth', isAuthenticated.toString());
  }, [isAuthenticated]);

  // Restore authenticated session on startup from backend
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const meRes = await api.getMe();
        if (meRes.authenticated && meRes.user) {
          setUser(meRes.user);
          setIsAuthenticated(true);

          // Fetch saved addresses
          try {
            const addrRes = await api.getAddresses();
            if (addrRes.addresses && addrRes.addresses.length > 0) {
              setAddresses(addrRes.addresses);
              const defaultAddr = addrRes.addresses.find((a) => a.is_default) || addrRes.addresses[0];
              setCurrentAddress(defaultAddr);
            }
          } catch (e) {
            console.warn('Could not fetch addresses on session restore', e);
          }
        }
      } catch (err) {
        console.warn('Session verification failed on startup', err);
      } finally {
        setIsLoadingSession(false);
      }
    };

    restoreSession();
  }, []);

  // Handle successful login
  const handleLoginSuccess = (userData, token) => {
    if (token) {
      localStorage.setItem('revive_token', token);
    }
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Update profile
  const updateProfile = async ({ name, email }) => {
    try {
      const res = await api.updateProfile({ name, email });
      if (res.success && res.user) {
        setUser((prev) => ({
          ...prev,
          name: res.user.name,
          email: res.user.email,
        }));
        return res.user;
      }
    } catch (err) {
      console.error('Update profile error:', err);
      // Fallback local update
      setUser((prev) => ({ ...prev, name, email }));
    }
  };

  // Save address
  const saveAddress = async (addressData) => {
    try {
      const res = await api.addAddress(addressData);
      if (res.success && res.address) {
        setAddresses((prev) => [res.address, ...prev]);
        setCurrentAddress(res.address);
        return res.address;
      }
    } catch (err) {
      console.error('Save address error:', err);
      const fallbackAddr = { ...addressData, id: `local_${Date.now()}` };
      setCurrentAddress(fallbackAddr);
      return fallbackAddr;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {}

    setUser(null);
    setCurrentAddress(null);
    setAddresses([]);
    setIsAuthenticated(false);
    localStorage.removeItem('revive_user');
    localStorage.removeItem('revive_address');
    localStorage.removeItem('revive_auth');
    localStorage.removeItem('revive_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentAddress,
        addresses,
        isAuthenticated,
        isLoadingSession,
        handleLoginSuccess,
        updateProfile,
        saveAddress,
        setCurrentAddress,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
