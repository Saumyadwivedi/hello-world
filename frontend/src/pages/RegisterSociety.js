import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSociety, getSocieties, joinSociety, getMe, logout } from '@/lib/api';
import { toast } from 'sonner';
import { ArrowLeft, Building, Plus, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const RegisterSociety = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    description: '',
    contact_name: '',
    contact_phone: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userResponse, societiesResponse] = await Promise.all([
        getMe(),
        getSocieties()
      ]);
      setUser(userResponse.data);
      setSocieties(societiesResponse.data);

      // If user already has a society, redirect
      if (userResponse.data.society_id) {
        toast.info('You are already part of a society');
        navigate('/home');
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSociety = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await createSociety(formData);
      toast.success('Society registration submitted! Waiting for admin approval.');
      setShowCreateForm(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to create society');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinSociety = async (societyId) => {
    try {
      await joinSociety(societyId, 'user');
      toast.success('Successfully joined society!');
      navigate('/home');
    } catch (error) {
      toast.error('Failed to join society');
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

  const approvedSocieties = societies.filter(s => s.status === 'approved');

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              data-testid="back-btn"
              onClick={() => navigate(-1)}
              className="mr-4 p-2 hover:bg-white rounded-full transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-[#666666]" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A1A]">
                Join a Society
              </h1>
              <p className="text-[#666666]">Select your residential society</p>
            </div>
          </div>

          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button data-testid="create-society-btn" className="btn-primary">
                <Plus className="h-5 w-5 mr-2" />
                Register New Society
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Register New Society</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSociety} className="space-y-4">
                <div>
                  <Label htmlFor="name">Society Name *</Label>
                  <Input
                    id="name"
                    data-testid="society-name-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    data-testid="society-address-input"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      data-testid="society-city-input"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      data-testid="society-state-input"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    data-testid="society-pincode-input"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    data-testid="society-description-input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the society"
                  />
                </div>

                <div>
                  <Label htmlFor="contact_name">Contact Person Name *</Label>
                  <Input
                    id="contact_name"
                    data-testid="contact-name-input"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contact_phone">Contact Phone *</Label>
                  <Input
                    id="contact_phone"
                    data-testid="contact-phone-input"
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    required
                  />
                </div>

                <Button
                  data-testid="submit-society-btn"
                  type="submit"
                  className="w-full btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit for Approval'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Approved Societies */}
        {approvedSocieties.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <Building className="h-16 w-16 text-[#E5E0D8] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
              No approved societies yet
            </h3>
            <p className="text-[#666666] mb-6">
              Be the first to register your society!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {approvedSocieties.map((society) => (
              <div
                key={society.society_id}
                data-testid={`society-${society.society_id}`}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-[#FF6B35] rounded-xl flex items-center justify-center">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <Badge className="bg-[#4CAF50] text-white">
                    Approved
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">
                  {society.name}
                </h3>
                <p className="text-sm text-[#666666] mb-4 line-clamp-2">
                  {society.address}, {society.city}, {society.state} - {society.pincode}
                </p>

                {society.description && (
                  <p className="text-sm text-[#666666] mb-4 line-clamp-3">
                    {society.description}
                  </p>
                )}

                <Button
                  data-testid={`join-society-${society.society_id}`}
                  onClick={() => handleJoinSociety(society.society_id)}
                  className="w-full btn-primary"
                >
                  Join Society
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterSociety;