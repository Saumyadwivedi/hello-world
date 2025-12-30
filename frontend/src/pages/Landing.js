import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Utensils, Building, ChefHat, Shield, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Floating Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Utensils className="h-8 w-8 text-[#FF6B35]" />
              <span className="text-2xl font-bold text-[#1A1A1A]">HomeCook Hub</span>
            </div>
            <Link to="/login">
              <Button data-testid="nav-login-btn" className="btn-primary">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1A1A1A] leading-tight mb-6">
                Delicious Homemade Food,{' '}
                <span className="text-[#FF6B35]">Right Next Door</span>
              </h1>
              <p className="text-lg text-[#666666] mb-8">
                Connect with talented home cooks in your society. Order fresh, authentic meals made with love by your neighbors.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/login">
                  <Button data-testid="hero-get-started-btn" className="btn-primary text-lg">
                    Order Now
                  </Button>
                </Link>
                <Link to="/login">
                  <Button data-testid="hero-become-seller-btn" className="btn-secondary text-lg">
                    Become a Seller
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <img
                  src="https://images.unsplash.com/photo-1758705207198-ea3145c96a93?crop=entropy&cs=srgb&fm=jpg&q=85"
                  alt="Delicious homemade food"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute top-4 right-4 bg-white rounded-full px-4 py-2 shadow-lg">
                  <span className="font-accent text-2xl text-[#FF6B35]">Fresh & Tasty!</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4">
              Why Choose HomeCook Hub?
            </h2>
            <p className="text-lg text-[#666666]">
              Experience the best of neighborhood dining
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-[#FDFBF7] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow"
            >
              <div className="w-16 h-16 bg-[#FF6B35] rounded-full flex items-center justify-center mb-6">
                <ChefHat className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">
                Authentic Home Cooking
              </h3>
              <p className="text-[#666666]">
                Enjoy freshly prepared meals by passionate home chefs in your community.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-[#FDFBF7] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow"
            >
              <div className="w-16 h-16 bg-[#4CAF50] rounded-full flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">
                Verified Sellers
              </h3>
              <p className="text-[#666666]">
                All sellers are verified with FSSAI licenses and approved by society admins.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="p-8 rounded-2xl bg-[#FDFBF7] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow"
            >
              <div className="w-16 h-16 bg-[#8BC34A] rounded-full flex items-center justify-center mb-6">
                <Leaf className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">
                Dietary Preferences
              </h3>
              <p className="text-[#666666]">
                Filter by Veg, Non-Veg, or Jain food to match your dietary needs.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4">
              How It Works
            </h2>
            <p className="text-lg text-[#666666]">
              Start ordering in 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#FF6B35] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">
                Join Your Society
              </h3>
              <p className="text-[#666666]">
                Register and get approved by your society admin to access local sellers.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[#4CAF50] rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">
                Browse & Order
              </h3>
              <p className="text-[#666666]">
                Explore delicious homemade meals from verified sellers in your community.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-[#FFC107] rounded-full flex items-center justify-center mx-auto mb-6 text-black text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-3">
                Enjoy Your Meal
              </h3>
              <p className="text-[#666666]">
                Pay securely with Stripe and enjoy fresh food delivered to your door.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#FF6B35] to-[#FFC107]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Taste Something Amazing?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Join thousands of happy neighbors enjoying homemade meals every day.
          </p>
          <Link to="/login">
            <Button data-testid="cta-get-started-btn" className="bg-white text-[#FF6B35] hover:bg-gray-100 text-lg px-8 py-6 rounded-full font-bold shadow-lg hover:scale-105 transition-all">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Utensils className="h-6 w-6 text-[#FF6B35]" />
            <span className="text-xl font-bold">HomeCook Hub</span>
          </div>
          <p className="text-gray-400 mb-4">
            Bringing neighbors together through food.
          </p>
          <p className="text-gray-500 text-sm">
            © 2025 HomeCook Hub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;