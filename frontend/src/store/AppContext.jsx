import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [mode, setMode] = useState(null); // 'auto' | 'manual'
  const [requestId, setRequestId] = useState(null);
  const [parsedItems, setParsedItems] = useState([]);
  const [cart, setCart] = useState(null);
  const [order, setOrder] = useState(null);

  const reset = () => {
    setMode(null);
    setRequestId(null);
    setParsedItems([]);
    setCart(null);
    setOrder(null);
  };

  return (
    <AppContext.Provider value={{
      mode, setMode,
      requestId, setRequestId,
      parsedItems, setParsedItems,
      cart, setCart,
      order, setOrder,
      reset,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
