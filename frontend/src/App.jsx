import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { useAuth } from './context/AuthContext';
import AnimatedLoader from './components/common/AnimatedLoader';
import Footer from './components/common/Footer';
import InputDefaults from './components/common/InputDefaults';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Home from './pages/global/Home';
import ProductListing from './pages/global/ProductListing';
import ProductDetail from './pages/global/ProductDetail';
import Cart from './pages/global/Cart';
import Checkout from './pages/global/Checkout';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerOrders from './pages/customer/CustomerOrders';
import CustomerProfile from './pages/customer/CustomerProfile';
import CustomerOrderDetail from './pages/customer/CustomerOrderDetail';
import VendorDashboard from './pages/vendor/VendorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ForgotPassword from './components/auth/ForgotPassword';
import EmailVerification from './components/auth/EmailVerification';
import PasswordReset from './components/auth/PasswordReset';
import { LoadingProvider } from './context/LoadingContext';

import PendingVendors from './components/admin/PendingVendors';
import UserManagement from './components/admin/UserManagement';
import ProductModeration from './components/admin/ProductModeration';
import OrderManagement from './components/admin/AdminOrderManagement';
import SystemSettings from './components/admin/SystemSettings';
import OverviewDashboard from './components/admin/OverviewDasboard';
import VendorOverview from './components/vendor/VendorOverview';
import ShopManagement from './components/vendor/ShopManagement';
import ProductManagement from './components/vendor/ProductManagement';
// import ProductManagement from './components/vendor/ProductManagement/index';
// import ProductManagement from './components/vendor/productManagement/ProductManagement';
import OrderManagementVendor from './components/vendor/OrderManagementVendor';
import RevenueAnalytics from './components/vendor/RevenueAnalytics';
import CategoryManagement from './components/admin/CategoryManagement';
import AddEditProduct from './components/vendor/AddEditProduct';
import AuthCallback from './components/auth/callbacks/AuthCallback';
import PaymentSuccess from './pages/global/PaymentSuccess';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <AnimatedLoader fullScreen size="lg" label="Checking session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

// Admin Layout wrapper
const AdminLayout = () => {
  return (
    <AdminDashboard>
      <Routes>
        <Route path="/" element={<OverviewDashboard />} />
        <Route path="/dashboard" element={<OverviewDashboard />} />
        <Route path="/pending-vendors" element={<PendingVendors />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/products" element={<ProductModeration />} />
        <Route path="/categories" element={<CategoryManagement />} />
        <Route path="/orders" element={<OrderManagement />} />
        <Route path="/settings" element={<SystemSettings />} />
      </Routes>
    </AdminDashboard>
  );
};

// Vendor Layout wrapper (add this after AdminLayout)
const VendorLayout = () => {
  return (
    <VendorDashboard>
      <Routes>
        <Route path="/dashboard" element={<VendorOverview />} />
        <Route path="/shop" element={<ShopManagement />} />
        <Route path="/products" element={<ProductManagement />} />
        <Route path="/products/add" element={<AddEditProduct />} />
        <Route path="/products/edit/:id" element={<AddEditProduct />} />
        <Route path="/orders" element={<OrderManagementVendor />} />
        <Route path="/revenue" element={<RevenueAnalytics />} />
      </Routes>
    </VendorDashboard>
  );
};

function AppContent() {
  return (
    <>
      <InputDefaults />
      <main className="min-h-screen">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<PasswordReset />} />
          <Route path="/auth-callback" element={<AuthCallback />} />

          {/* Customer Routes */}
          <Route path="/cart" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/payment-success" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <PaymentSuccess />
            </ProtectedRoute>
          } />
          <Route path="/customer/dashboard" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/customer/orders" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerOrders />
            </ProtectedRoute>
          } />
          <Route path="/customer/orders/:id" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerOrderDetail />
            </ProtectedRoute>
          } />
          <Route path="/customer/profile" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerProfile />
            </ProtectedRoute>
          } />

          {/* Vendor Routes */}
          <Route path="/vendor/*" element={
            <ProtectedRoute allowedRoles={['vendor']}>
              <VendorLayout />
            </ProtectedRoute>
          } />

          {/* Admin Routes - Nested */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <LoadingProvider>
          <AppContent />
        </LoadingProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;