import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Package, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getOrders();
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      preparing: 'status-preparing',
      ready: 'status-ready',
      delivered: 'status-delivered',
      cancelled: 'status-cancelled'
    };

    return (
      <Badge className={`${statusClasses[status]} rounded-full px-3 py-1`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status) => {
    return status === 'paid' ? (
      <Badge className="bg-[#4CAF50] text-white rounded-full px-3 py-1">
        Paid
      </Badge>
    ) : (
      <Badge className="bg-[#FFC107] text-black rounded-full px-3 py-1">
        Pending
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#FF6B35] border-r-transparent"></div>
          <p className="mt-4 text-[#666666]">Loading orders...</p>
        </div>
      </div>
    );
  }

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
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A]">
              My Orders
            </h1>
            <p className="text-[#666666]">Track your food orders</p>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-[#FDFBF7] rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-10 w-10 text-[#E5E0D8]" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
              No orders yet
            </h3>
            <p className="text-[#666666] mb-6">
              Start ordering delicious food from your neighbors!
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
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.order_id}
                data-testid={`order-${order.order_id}`}
                onClick={() => navigate(`/orders/${order.order_id}`)}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-[#666666] mb-1">Order ID</p>
                    <p className="font-bold text-[#1A1A1A]">{order.order_id}</p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(order.status)}
                    <div className="mt-2">
                      {getPaymentStatusBadge(order.payment_status)}
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#E5E0D8] pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 text-[#666666]">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-[#FF6B35]">
                      ${order.total_amount.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-sm text-[#666666]">
                    {order.items.length} item(s)
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;