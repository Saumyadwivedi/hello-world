import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
        <div className="w-20 h-20 bg-[#FFC107] rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-12 w-12 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-4">
          Payment Cancelled
        </h1>
        
        <p className="text-[#666666] mb-8">
          Your payment was cancelled. Your cart items are still saved.
        </p>
        
        <div className="space-y-3">
          <Button
            data-testid="return-to-cart-btn"
            onClick={() => navigate('/cart')}
            className="w-full btn-primary"
          >
            Return to Cart
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

export default PaymentCancel;