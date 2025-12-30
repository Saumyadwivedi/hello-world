import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrder, updateOrderStatus, getMe } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Package, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [orderId]);

  const fetchData = async () => {
    try {
      const [orderResponse, userResponse] = await Promise.all([
        getOrder(orderId),
        getMe()
      ]);
      setOrder(orderResponse.data);
      setUser(userResponse.data);
    } catch (error) {
      toast.error('Failed to load order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrder({ ...order, status: newStatus });
      toast.success('Order status updated');
    } catch (error) {
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
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

  const getFoodTypeIcon = (type) => {
    const className = type === 'veg' ? 'food-type-veg' : type === 'non-veg' ? 'food-type-non-veg' : 'food-type-jain';
    return <span className={className}></span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#FF6B35] border-r-transparent"></div>
          <p className="mt-4 text-[#666666]">Loading order...</p>
        </div>
      </div>
    );
  }

  const isSeller = user?.role === 'seller';

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            data-testid="back-btn"
            onClick={() => navigate('/orders')}
            className="mr-4 p-2 hover:bg-white rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-[#666666]" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#1A1A1A]">
              Order Details
            </h1>
            <p className="text-[#666666]">#{order.order_id}</p>
          </div>
          {getStatusBadge(order.status)}
        </div>

        {/* Order Info */}
        <div className="space-y-6">
          {/* Status Update (Seller Only) */}
          {isSeller && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">
                Update Order Status
              </h3>
              <Select
                value={order.status}
                onValueChange={handleStatusUpdate}
                disabled={updating}
              >
                <SelectTrigger data-testid="status-update-select" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready for Pickup</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">
              Order Items
            </h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  data-testid={`order-item-${index}`}
                  className="flex items-center justify-between py-3 border-b border-[#E5E0D8] last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-[#1A1A1A]">{item.name}</p>
                    <p className="text-sm text-[#666666]">
                      ${item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-[#FF6B35]">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Total */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">
              Payment Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-[#666666]">
                <span>Subtotal</span>
                <span>${order.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#666666]">
                <span>Delivery Fee</span>
                <span className="text-[#4CAF50]">Free</span>
              </div>
              <div className="flex justify-between text-[#666666]">
                <span>Payment Status</span>
                <Badge className={order.payment_status === 'paid' ? 'bg-[#4CAF50]' : 'bg-[#FFC107]'}>
                  {order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                </Badge>
              </div>
              <div className="border-t border-[#E5E0D8] pt-3">
                <div className="flex justify-between text-lg font-bold text-[#1A1A1A]">
                  <span>Total</span>
                  <span className="text-[#FF6B35]">${order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">
              Order Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-[#666666]">
                <Clock className="h-5 w-5" />
                <div>
                  <p className="text-sm">Order Placed</p>
                  <p className="font-medium text-[#1A1A1A]">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;