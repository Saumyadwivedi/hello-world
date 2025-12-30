import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createCheckout } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const PaymentCheckout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (!orderId) {
      toast.error('No order ID provided');
      navigate('/home');
      return;
    }

    initiateCheckout();
  }, [orderId]);

  const initiateCheckout = async () => {
    try {
      // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
      const hostUrl = window.location.origin;
      const response = await createCheckout(orderId, hostUrl);
      
      // Redirect to Stripe checkout
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Failed to create checkout session');
      navigate('/cart');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#FF6B35] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-2">
          Redirecting to payment...
        </h2>
        <p className="text-[#666666]">
          Please wait while we prepare your secure checkout
        </p>
      </div>
    </div>
  );
};

export default PaymentCheckout;