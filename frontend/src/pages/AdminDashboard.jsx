import React, { useState } from 'react';
import {
  Users, ShoppingBag, Package, DollarSign,
  TrendingUp, Clock, CheckCircle, XCircle,
  Settings, Eye, EyeOff, UserCheck, UserX
} from 'lucide-react';
import PendingVendors from '../components/admin/PendingVendors';
// import UserManagement from '../components/admin/UserManagement';
import UserManagement from '../components/admin/UserManagement'
import ProductModeration from '../components/admin/ProductModeration';
import OrderManagement from '../components/admin/OrderManagement';
import SystemSettings from '../components/admin/SystemSettings';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'vendors', name: 'Pending Vendors', icon: Users },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'products', name: 'Products', icon: Package },
    { id: 'orders', name: 'Orders', icon: ShoppingBag },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AnalyticsDashboard />;
      case 'vendors':
        return <PendingVendors />;
      case 'users':
        return <UserManagement />;
      case 'products':
        return <ProductModeration />;
      case 'orders':
        return <OrderManagement />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <AnalyticsDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-primary text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-white/80 mt-1">Manage vendors, products, orders and platform settings</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2 mb-6 border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition ${
                  activeTab === tab.id
                    ? 'bg-white text-primary border-b-2 border-primary'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                <Icon size={18} />
                {tab.name}
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;