import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { createOrder, getMe } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, clearCart, sellerId, totalAmount } = useCart();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await getMe();
      setUser(response.data);
    } catch (error) {
      toast.error('Failed to load user data');
    }
  };

  const handleCheckout = async () => {
    if (!sellerId || cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        seller_id: sellerId,
        items: cart.map(item => ({
          item_id: item.item_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      };

      const response = await createOrder(orderData);
      const orderId = response.data.order_id;

      // Redirect to payment
      navigate(`/payment/checkout?order_id=${orderId}`);
    } catch (error) {
      toast.error('Failed to create order');
      setLoading(false);
    }
  };

  const getFoodTypeIcon = (type) => {
    const className = type === 'veg' ? 'food-type-veg' : type === 'non-veg' ? 'food-type-non-veg' : 'food-type-jain';
    return <span className={className}></span>;
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            data-testid="back-btn"
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-white rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-[#666666]" />
          </button>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">
            Your Cart
          </h1>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-[#FDFBF7] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-10 w-10 text-[#E5E0D8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
              Your cart is empty
            </h3>
            <p className="text-[#666666] mb-6">
              Add some delicious items to get started!
            </p>
            <Button
              data-testid="browse-food-btn"
              onClick={() => navigate('/home')}
              className="btn-primary"
            >
              Browse Food
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.item_id}
                  data-testid={`cart-item-${item.item_id}`}
                  className="bg-white rounded-2xl p-4 flex items-center space-x-4 shadow-sm"
                >
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1627955280978-f54fff2f316a'}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-xl"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          {getFoodTypeIcon(item.food_type)}
                          <h3 className="font-bold text-[#1A1A1A]">{item.name}</h3>
                        </div>
                        <p className="text-sm text-[#666666]">${item.price.toFixed(2)} each</p>
                      </div>
                      <button
                        data-testid={`remove-item-${item.item_id}`}
                        onClick={() => removeFromCart(item.item_id)}
                        className="p-2 hover:bg-[#FDFBF7] rounded-full transition-colors"
                      >
                        <Trash2 className="h-5 w-5 text-[#E53935]" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 bg-[#FDFBF7] rounded-full px-4 py-2">
                        <button
                          data-testid={`decrease-qty-${item.item_id}`}
                          onClick={() => updateQuantity(item.item_id, item.quantity - 1)}
                          className="text-[#FF6B35] hover:text-[#E85A2D]"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="font-bold text-[#1A1A1A] min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          data-testid={`increase-qty-${item.item_id}`}
                          onClick={() => updateQuantity(item.item_id, item.quantity + 1)}
                          className="text-[#FF6B35] hover:text-[#E85A2D]"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <span className="font-bold text-[#FF6B35] text-lg">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">
                  Order Summary
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-[#666666]">
                    <span>Subtotal</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[#666666]">
                    <span>Delivery Fee</span>
                    <span className="text-[#4CAF50]">Free</span>
                  </div>
                  <div className="border-t border-[#E5E0D8] pt-3">
                    <div className="flex justify-between text-lg font-bold text-[#1A1A1A]">
                      <span>Total</span>
                      <span className="text-[#FF6B35]">${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <Button
                  data-testid="proceed-to-checkout-btn"
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full btn-primary"
                >
                  {loading ? 'Processing...' : 'Proceed to Checkout'}
                </Button>
                
                <button
                  data-testid="clear-cart-btn"
                  onClick={clearCart}
                  className="w-full mt-3 py-3 text-[#E53935] hover:bg-[#FDFBF7] rounded-full transition-colors font-medium"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;