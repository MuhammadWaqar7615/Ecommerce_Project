import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Home from './pages/Home';
import ProductListing from './pages/ProductListing';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CustomerDashboard from './pages/CustomerDashboard';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './components/auth/ForgotPassword';
import EmailVerification from './pages/EmailVerification';
import PasswordReset from './pages/PasswordReset';
import CustomerOrders from './pages/CustomerOrders';
import CustomerProfile from './pages/CustomerProfile';
import { LoadingProvider } from './context/LoadingContext';

// Import Admin Components
import PendingVendors from './components/admin/PendingVendors';
import UserManagement from './components/admin/UserManagement';
import ProductModeration from './components/admin/ProductModeration';
import OrderManagement from './components/admin/AdminOrderManagement';
import SystemSettings from './components/admin/SystemSettings';
import AnalyticsDashboard from './components/admin/AnalyticsDashboard';
import VendorOverview from './components/vendor/VendorOverview';
import ShopManagement from './components/vendor/ShopManagement';
import ProductManagement from './components/vendor/ProductManagement';
// import ProductManagement from './components/vendor/ProductManagement/index';
// import ProductManagement from './components/vendor/productManagement/ProductManagement';
import OrderManagementVendor from './components/vendor/OrderManagementVendor';
import RevenueAnalytics from './components/vendor/RevenueAnalytics';
import CustomerOrderDetail from './pages/CustomerOrderDetail';
import CategoryManagement from './components/admin/CategoryManagement';
import AddEditProduct from './pages/AddEditProduct';
import AuthCallback from './pages/AuthCallback';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
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
        <Route path="/" element={<AnalyticsDashboard />} />
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
        <Route path="/" element={<VendorOverview />} />
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