import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFoodItems, createFoodItem, getOrders, logout } from '@/lib/api';
import { toast } from 'sonner';
import { Plus, Utensils, LogOut, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [foodItems, setFoodItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    food_type: 'veg',
    image_url: '',
    available: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsResponse, ordersResponse] = await Promise.all([
        getFoodItems({}),
        getOrders()
      ]);
      setFoodItems(itemsResponse.data);
      setOrders(ordersResponse.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await createFoodItem({ ...formData, price: parseFloat(formData.price) });
      toast.success('Food item added successfully');
      setShowAddForm(false);
      setFormData({
        name: '',
        description: '',
        price: '',
        food_type: 'veg',
        image_url: '',
        available: true
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to add food item');
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

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 nav-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Utensils className="h-8 w-8 text-[#FF6B35]" />
              <div>
                <span className="text-xl font-bold text-[#1A1A1A]">Seller Dashboard</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                data-testid="view-orders-btn"
                onClick={() => navigate('/orders')}
                className="flex items-center space-x-2 text-[#666666] hover:text-[#FF6B35]"
              >
                <Package className="h-5 w-5" />
                <span>Orders</span>
              </button>
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
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1A1A1A]">
              My Menu
            </h1>
            <p className="text-[#666666]">Manage your food items</p>
          </div>

          <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
            <DialogTrigger asChild>
              <Button data-testid="add-food-item-btn" className="btn-primary">
                <Plus className="h-5 w-5 mr-2" />
                Add Food Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Add New Food Item</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <Label htmlFor="name">Dish Name *</Label>
                  <Input
                    id="name"
                    data-testid="food-name-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    data-testid="food-description-input"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    data-testid="food-price-input"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="food_type">Food Type *</Label>
                  <Select
                    value={formData.food_type}
                    onValueChange={(value) => setFormData({ ...formData, food_type: value })}
                  >
                    <SelectTrigger data-testid="food-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="veg">Vegetarian</SelectItem>
                      <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                      <SelectItem value="jain">Jain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="image_url">Image URL (optional)</Label>
                  <Input
                    id="image_url"
                    data-testid="food-image-input"
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  />
                </div>

                <Button
                  data-testid="submit-food-item-btn"
                  type="submit"
                  className="w-full btn-primary"
                >
                  Add Item
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-[#666666] mb-1">Total Items</p>
            <p className="text-3xl font-bold text-[#1A1A1A]">{foodItems.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-[#666666] mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-[#FF6B35]">{orders.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-[#666666] mb-1">Pending Orders</p>
            <p className="text-3xl font-bold text-[#FFC107]">
              {orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length}
            </p>
          </div>
        </div>

        {/* Food Items */}
        {foodItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <Utensils className="h-16 w-16 text-[#E5E0D8] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
              No food items yet
            </h3>
            <p className="text-[#666666] mb-6">
              Start adding delicious items to your menu!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {foodItems.map((item) => (
              <div key={item.item_id} className="food-card">
                <div className="relative h-48">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1627955280978-f54fff2f316a'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 shadow-md">
                    <span className="text-[#FF6B35] font-bold">${item.price.toFixed(2)}</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-[#1A1A1A]">{item.name}</h3>
                    <Badge className="bg-[#4CAF50] text-white text-xs">
                      {item.food_type}
                    </Badge>
                  </div>
                  {item.description && (
                    <p className="text-sm text-[#666666] line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;