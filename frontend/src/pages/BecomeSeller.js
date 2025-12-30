import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerSeller, getMe, logout } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Upload, FileText, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const BecomeSeller = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    aadhar_number: '',
    fssai_number: '',
    aadhar_doc: null,
    fssai_doc: null
  });

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await getMe();
      setUser(response.data);

      if (!response.data.society_id) {
        toast.error('Please join a society first');
        navigate('/register-society');
      } else if (response.data.role === 'seller') {
        toast.info('You are already a seller');
        navigate('/seller/dashboard');
      }
    } catch (error) {
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.aadhar_doc || !formData.fssai_doc) {
      toast.error('Please upload both documents');
      return;
    }

    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('business_name', formData.business_name);
      formDataToSend.append('aadhar_number', formData.aadhar_number);
      formDataToSend.append('fssai_number', formData.fssai_number);
      formDataToSend.append('aadhar_doc', formData.aadhar_doc);
      formDataToSend.append('fssai_doc', formData.fssai_doc);

      await registerSeller(formDataToSend);
      toast.success('Seller registration submitted! Waiting for society admin approval.');
      navigate('/home');
    } catch (error) {
      toast.error('Failed to register as seller');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      document.cookie = 'session_token=; path=/; max-age=0';
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      document.cookie = 'session_token=; path=/; max-age=0';
      navigate('/login');
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

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
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
              Become a Seller
            </h1>
            <p className="text-[#666666]">Share your delicious food with neighbors</p>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-[#FF6B35] to-[#FFC107] rounded-2xl p-6 mb-8 text-white">
          <h3 className="text-xl font-bold mb-2">
            Start Earning from Your Kitchen!
          </h3>
          <p className="text-white/90">
            Join our community of home chefs and turn your passion for cooking into a business.
            All sellers are verified and approved by society admins.
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="business_name">Business Name *</Label>
              <Input
                id="business_name"
                data-testid="business-name-input"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                placeholder="e.g., Aunty's Kitchen"
                required
              />
            </div>

            <div>
              <Label htmlFor="aadhar_number">Aadhar Number *</Label>
              <Input
                id="aadhar_number"
                data-testid="aadhar-number-input"
                value={formData.aadhar_number}
                onChange={(e) => setFormData({ ...formData, aadhar_number: e.target.value })}
                placeholder="XXXX XXXX XXXX"
                required
              />
            </div>

            <div>
              <Label htmlFor="aadhar_doc">Upload Aadhar Card *</Label>
              <div className="mt-2">
                <label
                  htmlFor="aadhar_doc"
                  className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-[#E5E0D8] rounded-xl cursor-pointer hover:border-[#FF6B35] transition-colors"
                >
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-[#666666] mx-auto mb-2" />
                    <p className="text-sm text-[#666666]">
                      {formData.aadhar_doc ? formData.aadhar_doc.name : 'Click to upload Aadhar card'}
                    </p>
                  </div>
                  <input
                    id="aadhar_doc"
                    data-testid="aadhar-doc-input"
                    type="file"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={(e) => setFormData({ ...formData, aadhar_doc: e.target.files[0] })}
                    required
                  />
                </label>
              </div>
            </div>

            <div>
              <Label htmlFor="fssai_number">FSSAI License Number *</Label>
              <Input
                id="fssai_number"
                data-testid="fssai-number-input"
                value={formData.fssai_number}
                onChange={(e) => setFormData({ ...formData, fssai_number: e.target.value })}
                placeholder="Enter 14-digit FSSAI number"
                required
              />
            </div>

            <div>
              <Label htmlFor="fssai_doc">Upload FSSAI License *</Label>
              <div className="mt-2">
                <label
                  htmlFor="fssai_doc"
                  className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-[#E5E0D8] rounded-xl cursor-pointer hover:border-[#FF6B35] transition-colors"
                >
                  <div className="text-center">
                    <Upload className="h-8 w-8 text-[#666666] mx-auto mb-2" />
                    <p className="text-sm text-[#666666]">
                      {formData.fssai_doc ? formData.fssai_doc.name : 'Click to upload FSSAI license'}
                    </p>
                  </div>
                  <input
                    id="fssai_doc"
                    data-testid="fssai-doc-input"
                    type="file"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={(e) => setFormData({ ...formData, fssai_doc: e.target.files[0] })}
                    required
                  />
                </label>
              </div>
            </div>

            <div className="bg-[#FDFBF7] rounded-xl p-4">
              <p className="text-sm text-[#666666]">
                <strong className="text-[#1A1A1A]">Note:</strong> Your application will be reviewed by your society admin.
                You'll receive a notification once approved.
              </p>
            </div>

            <Button
              data-testid="submit-seller-application-btn"
              type="submit"
              className="w-full btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BecomeSeller;