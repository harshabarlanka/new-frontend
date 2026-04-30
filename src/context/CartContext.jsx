import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [], totalAmount: 0 });
      return;
    }
    try {
      setLoading(true);
      const { data } = await cartAPI.getCart();
      setCart(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    const { data } = await cartAPI.addToCart(productId, quantity);
    setCart(data.data);
    return data;
  }, []);

  const updateItem = useCallback(async (productId, quantity) => {
    const { data } = await cartAPI.updateItem(productId, quantity);
    setCart(data.data);
  }, []);

  const removeItem = useCallback(async (productId) => {
    const { data } = await cartAPI.removeItem(productId);
    setCart(data.data);
  }, []);

  const clearCart = useCallback(async () => {
    await cartAPI.clearCart();
    setCart({ items: [], totalAmount: 0 });
  }, []);

  const cartCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        cartCount,
        addToCart,
        updateItem,
        removeItem,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export default CartContext;
