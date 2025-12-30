import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [sellerId, setSellerId] = useState(null);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedSellerId = localStorage.getItem('cart_seller_id');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    if (savedSellerId) {
      setSellerId(savedSellerId);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
    if (sellerId) {
      localStorage.setItem('cart_seller_id', sellerId);
    }
  }, [cart, sellerId]);

  const addToCart = (item, seller_id) => {
    // Check if switching sellers
    if (sellerId && sellerId !== seller_id) {
      const confirmed = window.confirm('You can only order from one seller at a time. Clear current cart?');
      if (!confirmed) return;
      setCart([]);
    }

    setSellerId(seller_id);

    const existingItem = cart.find((i) => i.item_id === item.item_id);
    if (existingItem) {
      setCart(cart.map((i) =>
        i.item_id === item.item_id ? { ...i, quantity: i.quantity + 1 } : i
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    const newCart = cart.filter((i) => i.item_id !== itemId);
    setCart(newCart);
    if (newCart.length === 0) {
      setSellerId(null);
      localStorage.removeItem('cart_seller_id');
    }
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map((i) =>
        i.item_id === itemId ? { ...i, quantity } : i
      ));
    }
  };

  const clearCart = () => {
    setCart([]);
    setSellerId(null);
    localStorage.removeItem('cart');
    localStorage.removeItem('cart_seller_id');
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      cart,
      sellerId,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalAmount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;