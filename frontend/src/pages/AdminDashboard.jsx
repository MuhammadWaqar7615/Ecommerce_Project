import React from 'react';
import DashboardLayout from '../components/common/DashboardLayout';

const AdminDashboard = ({ children }) => {
  return (
    <DashboardLayout 
      title="Admin Dashboard" 
      subtitle="Manage vendors, products, orders and platform settings"
    >
      <div className="bg-white rounded-lg shadow-lg p-6">
        {children}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;