import { useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { CartProvider } from '@/context/CartContext';

// Pages
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import AuthCallback from '@/pages/AuthCallback';
import ProtectedRoute from '@/components/ProtectedRoute';
import Dashboard from '@/pages/Dashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import SocietyAdminDashboard from '@/pages/SocietyAdminDashboard';
import SellerDashboard from '@/pages/SellerDashboard';
import UserHome from '@/pages/UserHome';
import RegisterSociety from '@/pages/RegisterSociety';
import BecomeSeller from '@/pages/BecomeSeller';
import Cart from '@/pages/Cart';
import Orders from '@/pages/Orders';
import OrderDetails from '@/pages/OrderDetails';
import PaymentCheckout from '@/pages/PaymentCheckout';
import PaymentSuccess from '@/pages/PaymentSuccess';
import PaymentCancel from '@/pages/PaymentCancel';

function AppRouter() {
  const location = useLocation();
  
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/society-admin/dashboard" element={
          <ProtectedRoute requiredRole="society_admin">
            <SocietyAdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/seller/dashboard" element={
          <ProtectedRoute requiredRole="seller">
            <SellerDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/home" element={
          <ProtectedRoute>
            <UserHome />
          </ProtectedRoute>
        } />
        
        <Route path="/register-society" element={
          <ProtectedRoute>
            <RegisterSociety />
          </ProtectedRoute>
        } />
        
        <Route path="/become-seller" element={
          <ProtectedRoute>
            <BecomeSeller />
          </ProtectedRoute>
        } />
        
        <Route path="/cart" element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        } />
        
        <Route path="/orders" element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        } />
        
        <Route path="/orders/:orderId" element={
          <ProtectedRoute>
            <OrderDetails />
          </ProtectedRoute>
        } />
        
        <Route path="/payment/checkout" element={
          <ProtectedRoute>
            <PaymentCheckout />
          </ProtectedRoute>
        } />
        
        <Route path="/payment/success" element={
          <ProtectedRoute>
            <PaymentSuccess />
          </ProtectedRoute>
        } />
        
        <Route path="/payment/cancel" element={
          <ProtectedRoute>
            <PaymentCancel />
          </ProtectedRoute>
        } />
      </Routes>
      <Toaster richColors position="top-right" />
    </>
  );
}

function App() {
  return (
    <CartProvider>
      <div className="App">
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </div>
    </CartProvider>
  );
}

export default App;