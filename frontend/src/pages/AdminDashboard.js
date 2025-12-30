import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStats, getSocieties, approveSociety, logout } from '@/lib/api';
import { toast } from 'sonner';
import { Building, Users, Package, Utensils, LogOut, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsResponse, societiesResponse] = await Promise.all([
        getAdminStats(),
        getSocieties()
      ]);
      setStats(statsResponse.data);
      setSocieties(societiesResponse.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSociety = async (societyId, status) => {
    try {
      await approveSociety(societyId, status);
      toast.success(`Society ${status}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update society status');
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

  const pendingSocieties = societies.filter(s => s.status === 'pending');

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 nav-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Utensils className="h-8 w-8 text-[#FF6B35]" />
              <div>
                <span className="text-xl font-bold text-[#1A1A1A]">Admin Dashboard</span>
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
          Welcome, Admin!
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#FF6B35] rounded-xl flex items-center justify-center">
                <Building className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-[#666666] mb-1">Total Societies</p>
            <p className="text-3xl font-bold text-[#1A1A1A]">{stats?.total_societies || 0}</p>
            {stats?.pending_societies > 0 && (
              <Badge className="mt-2 status-pending">
                {stats.pending_societies} pending
              </Badge>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#4CAF50] rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-[#666666] mb-1">Total Users</p>
            <p className="text-3xl font-bold text-[#1A1A1A]">{stats?.total_users || 0}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#FFC107] rounded-xl flex items-center justify-center">
                <Utensils className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-[#666666] mb-1">Total Sellers</p>
            <p className="text-3xl font-bold text-[#1A1A1A]">{stats?.total_sellers || 0}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#8BC34A] rounded-xl flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
            </div>
            <p className="text-sm text-[#666666] mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-[#1A1A1A]">{stats?.total_orders || 0}</p>
          </div>
        </div>

        {/* Pending Societies */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-6">
            Pending Society Approvals
          </h2>

          {pendingSocieties.length === 0 ? (
            <p className="text-center text-[#666666] py-8">
              No pending societies
            </p>
          ) : (
            <div className="space-y-4">
              {pendingSocieties.map((society) => (
                <div
                  key={society.society_id}
                  data-testid={`pending-society-${society.society_id}`}
                  className="border border-[#E5E0D8] rounded-xl p-4 flex items-start justify-between"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-[#1A1A1A] mb-1">{society.name}</h3>
                    <p className="text-sm text-[#666666] mb-2">
                      {society.address}, {society.city}, {society.state} - {society.pincode}
                    </p>
                    <p className="text-sm text-[#666666]">
                      Contact: {society.contact_name} ({society.contact_phone})
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      data-testid={`approve-society-${society.society_id}`}
                      onClick={() => handleApproveSociety(society.society_id, 'approved')}
                      className="bg-[#4CAF50] hover:bg-[#43A047] text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      data-testid={`reject-society-${society.society_id}`}
                      onClick={() => handleApproveSociety(society.society_id, 'rejected')}
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
      </div>
    </div>
  );
};

export default AdminDashboard;