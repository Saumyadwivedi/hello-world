import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { checkPaymentStatus } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState(null);
  const sessionId = searchParams.get('session_id');
  const pollingAttempts = useRef(0);
  const maxAttempts = 5;

  useEffect(() => {
    if (!sessionId) {
      toast.error('Invalid payment session');
      navigate('/home');
      return;
    }

    pollPaymentStatus();
  }, [sessionId]);

  const pollPaymentStatus = async () => {
    if (pollingAttempts.current >= maxAttempts) {
      toast.error('Payment verification timed out');
      setLoading(false);
      return;
    }

    try {
      const response = await checkPaymentStatus(sessionId);
      
      if (response.data.status === 'paid') {
        setOrderId(response.data.order_id);
        clearCart();
        setLoading(false);
        toast.success('Payment successful!');
      } else {
        pollingAttempts.current += 1;
        setTimeout(pollPaymentStatus, 2000);
      }
    } catch (error) {
      pollingAttempts.current += 1;
      if (pollingAttempts.current < maxAttempts) {
        setTimeout(pollPaymentStatus, 2000);
      } else {
        toast.error('Failed to verify payment');
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#FF6B35] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">
            Verifying payment...
          </h2>
          <p className="text-[#666666]">
            Please wait while we confirm your payment
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
        <div className="w-20 h-20 bg-[#4CAF50] rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-12 w-12 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-4">
          Payment Successful!
        </h1>
        
        <p className="text-[#666666] mb-8">
          Thank you for your order. Your delicious meal is being prepared!
        </p>
        
        {orderId && (
          <div className="bg-[#FDFBF7] rounded-xl p-4 mb-6">
            <p className="text-sm text-[#666666] mb-1">Order ID</p>
            <p className="font-bold text-[#1A1A1A]">{orderId}</p>
          </div>
        )}
        
        <div className="space-y-3">
          <Button
            data-testid="view-order-btn"
            onClick={() => navigate(`/orders/${orderId}`)}
            className="w-full btn-primary"
          >
            View Order
          </Button>
          
          <Button
            data-testid="continue-shopping-btn"
            onClick={() => navigate('/home')}
            className="w-full bg-white border-2 border-[#E5E0D8] text-[#1A1A1A] hover:bg-[#FDFBF7] rounded-full py-3"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;