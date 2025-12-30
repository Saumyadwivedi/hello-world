import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFoodItems, getMe, getSociety } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { Search, Filter, ShoppingCart, Utensils, LogOut, User, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import axios from 'axios';

const UserHome = () => {
  const navigate = useNavigate();
  const { addToCart, totalItems } = useCart();
  const [user, setUser] = useState(null);
  const [society, setSociety] = useState(null);
  const [foodItems, setFoodItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [foodTypeFilter, setFoodTypeFilter] = useState('all');
  const [sellerStatus, setSellerStatus] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchQuery, foodTypeFilter, foodItems]);

  const fetchData = async () => {
    try {
      const userResponse = await getMe();
      setUser(userResponse.data);

      if (!userResponse.data.society_id) {
        toast.error('Please join a society first');
        navigate('/register-society');
        return;
      }

      const [societyResponse, itemsResponse] = await Promise.all([\n        getSociety(userResponse.data.society_id),
        getFoodItems({ society_id: userResponse.data.society_id })
      ]);

      setSociety(societyResponse.data);
      setFoodItems(itemsResponse.data);
      setFilteredItems(itemsResponse.data);
      
      // Check seller status
      try {
        const sellerStatusResponse = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/sellers/my-status`, {
          withCredentials: true
        });
        setSellerStatus(sellerStatusResponse.data);
        
        // If approved as seller, redirect to seller dashboard
        if (sellerStatusResponse.data.status === 'approved') {
          toast.info('You are now a seller! Redirecting to your dashboard...');
          setTimeout(() => {
            window.location.href = '/seller/dashboard';
          }, 2000);
        }
      } catch (error) {
        // User is not a seller, that's fine
      }
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = foodItems;

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (foodTypeFilter !== 'all') {
      filtered = filtered.filter(item => item.food_type === foodTypeFilter);
    }

    setFilteredItems(filtered);
  };

  const handleAddToCart = (item) => {
    addToCart(item, item.seller_id);
    toast.success(`${item.name} added to cart!`);
  };

  const handleLogout = () => {
    document.cookie = 'session_token=; path=/; max-age=0';
    toast.success('Logged out successfully');
    navigate('/login');
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
                <span className="text-xl font-bold text-[#1A1A1A]">HomeCook Hub</span>
                {society && (
                  <p className="text-xs text-[#666666]">{society.name}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                data-testid="view-orders-btn"
                onClick={() => navigate('/orders')}
                className="flex items-center space-x-2 text-[#666666] hover:text-[#FF6B35]"
              >
                <Package className="h-5 w-5" />
                <span className="hidden sm:inline">Orders</span>
              </button>
              
              <button
                data-testid="view-cart-btn"
                onClick={() => navigate('/cart')}
                className="relative flex items-center space-x-2 text-[#666666] hover:text-[#FF6B35]"
              >
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-[#FF6B35] text-white">
                    {totalItems}
                  </Badge>
                )}
                <span className="hidden sm:inline">Cart</span>
              </button>
              
              <button
                data-testid="logout-btn"
                onClick={handleLogout}
                className="flex items-center space-x-2 text-[#666666] hover:text-[#FF6B35]"
              >
                <LogOut className="h-5 w-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Seller Status Banner */}
        {sellerStatus && sellerStatus.is_seller && sellerStatus.status === 'pending' && (
          <div className="mb-6 bg-[#FFC107] text-black rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-bold">Seller Application Pending</p>
              <p className="text-sm">Your seller application is awaiting society admin approval.</p>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-2">
            Hey {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-lg text-[#666666]">
            What would you like to order today?
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#666666]" />
            <Input
              data-testid="search-food-input"
              type="text"
              placeholder="Search for dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-full border-[#E5E0D8] focus:border-[#FF6B35]"
            />
          </div>
          
          <Select value={foodTypeFilter} onValueChange={setFoodTypeFilter}>
            <SelectTrigger data-testid="food-type-filter" className="w-full sm:w-48 rounded-full border-[#E5E0D8]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="veg">Vegetarian</SelectItem>
              <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
              <SelectItem value="jain">Jain</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Food Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <Utensils className="h-16 w-16 text-[#E5E0D8] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
              No food items found
            </h3>
            <p className="text-[#666666]">
              {foodItems.length === 0
                ? 'No sellers have added food items yet'
                : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.item_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                data-testid={`food-item-${index}`}
                className="food-card group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1627955280978-f54fff2f316a'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    {getFoodTypeIcon(item.food_type)}
                  </div>
                  <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 shadow-md">
                    <span className="text-[#FF6B35] font-bold">${item.price.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-[#666666] mb-4 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  
                  <Button
                    data-testid={`add-to-cart-btn-${index}`}
                    onClick={() => handleAddToCart(item)}
                    className="w-full btn-primary"
                  >
                    Add to Cart
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHome;