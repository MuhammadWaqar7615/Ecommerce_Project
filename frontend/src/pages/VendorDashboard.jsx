import React from 'react';
import DashboardLayout from '../components/common/DashboardLayout';

const VendorDashboard = ({ children }) => {
  return (
    <DashboardLayout 
      title="Vendor Dashboard" 
      subtitle="Manage your shop, products, orders and track revenue"
    >
      <div className="bg-white rounded-lg shadow-lg p-6">
        {children}
      </div>
    </DashboardLayout>
  );
};

export default VendorDashboard;