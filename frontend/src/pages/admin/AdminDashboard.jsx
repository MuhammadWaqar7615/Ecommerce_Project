import React from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';

const AdminDashboard = ({ children }) => {
  const location = useLocation();
  const path = location.pathname.replace(/\/+$/, '');
  const isOverview = path === '/admin/dashboard' || path === '/admin';

  return (
    <DashboardLayout 
      title="Admin Dashboard" 
      subtitle="Platform overview and administrative controls"
    >
      <div className="bg-white rounded-lg shadow-lg p-6">
        {children}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;