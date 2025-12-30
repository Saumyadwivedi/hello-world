import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSellers, approveSeller, logout } from '@/lib/api';
import { toast } from 'sonner';
import { Users, Utensils, LogOut, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const SocietyAdminDashboard = () => {
  const navigate = useNavigate();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const response = await getSellers();
      setSellers(response.data);
    } catch (error) {
      toast.error('Failed to load sellers');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSeller = async (sellerId, status) => {
    try {
      await approveSeller(sellerId, status);
      toast.success(`Seller ${status}`);
      fetchSellers();
    } catch (error) {
      toast.error('Failed to update seller status');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      document.cookie = 'session_token=; path=/; max-age=0';
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#FF6B35] border-r-transparent"></div>
          <p className="mt-4 text-[#666666]">Loading...</p>
        </div>
      </div>
    );
  }

  const pendingSellers = sellers.filter(s => s.status === 'pending');
  const approvedSellers = sellers.filter(s => s.status === 'approved');

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 nav-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Utensils className="h-8 w-8 text-[#FF6B35]" />
              <div>
                <span className="text-xl font-bold text-[#1A1A1A]">Society Admin Dashboard</span>
              </div>
            </div>
            <button
              data-testid="logout-btn"
              onClick={handleLogout}
              className="flex items-center space-x-2 text-[#666666] hover:text-[#FF6B35]"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-8">
          Seller Management
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-[#666666] mb-1">Total Sellers</p>
            <p className="text-3xl font-bold text-[#1A1A1A]">{sellers.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-[#666666] mb-1">Approved Sellers</p>
            <p className="text-3xl font-bold text-[#4CAF50]">{approvedSellers.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-[#666666] mb-1">Pending Approvals</p>
            <p className="text-3xl font-bold text-[#FFC107]">{pendingSellers.length}</p>
          </div>
        </div>

        {/* Pending Sellers */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-6">
            Pending Seller Approvals
          </h2>

          {pendingSellers.length === 0 ? (
            <p className="text-center text-[#666666] py-8">
              No pending seller applications
            </p>
          ) : (
            <div className="space-y-4">
              {pendingSellers.map((seller) => (
                <div
                  key={seller.seller_id}
                  data-testid={`pending-seller-${seller.seller_id}`}
                  className="border border-[#E5E0D8] rounded-xl p-4 flex items-start justify-between"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-[#1A1A1A] mb-1">{seller.business_name}</h3>
                    <p className="text-sm text-[#666666] mb-1">
                      Aadhar: {seller.aadhar_number}
                    </p>
                    <p className="text-sm text-[#666666]">
                      FSSAI: {seller.fssai_number}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      data-testid={`approve-seller-${seller.seller_id}`}
                      onClick={() => handleApproveSeller(seller.seller_id, 'approved')}
                      className="bg-[#4CAF50] hover:bg-[#43A047] text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      data-testid={`reject-seller-${seller.seller_id}`}
                      onClick={() => handleApproveSeller(seller.seller_id, 'rejected')}
                      className="bg-[#E53935] hover:bg-[#D32F2F] text-white"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approved Sellers */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-6">
            Approved Sellers
          </h2>

          {approvedSellers.length === 0 ? (
            <p className="text-center text-[#666666] py-8">
              No approved sellers yet
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {approvedSellers.map((seller) => (
                <div
                  key={seller.seller_id}
                  className="border border-[#E5E0D8] rounded-xl p-4"
                >
                  <h3 className="font-bold text-[#1A1A1A] mb-1">{seller.business_name}</h3>
                  <Badge className="bg-[#4CAF50] text-white">Approved</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocietyAdminDashboard;