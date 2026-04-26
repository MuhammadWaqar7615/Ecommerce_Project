import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getShop } from '../services/vendor';

const VendorDashboard = () => {
  const { user } = useAuth();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.isVendorApproved) {
      fetchShop();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchShop = async () => {
    try {
      const data = await getShop();
      setShop(data.shop);
    } catch (error) {
      console.error('Error fetching shop:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show if user is not logged in
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Please login to access vendor dashboard.</p>
        </div>
      </div>
    );
  }

  // Show pending approval message
  if (!user.isVendorApproved) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <h2 className="font-bold text-lg mb-2">Account Pending Approval</h2>
          <p>Your vendor account is waiting for admin approval.</p>
          <p className="text-sm mt-2">Email: {user.email}</p>
          <p className="text-sm">Username: {user.username}</p>
          <div className="mt-4 p-3 bg-yellow-50 rounded">
            <p className="text-sm">Once approved, you will be able to:</p>
            <ul className="text-sm list-disc list-inside mt-1">
              <li>Create your shop</li>
              <li>Add products</li>
              <li>Manage orders</li>
              <li>View revenue analytics</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Vendor Dashboard</h1>
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">Shop Status</h3>
          <p className="text-2xl font-bold text-primary">
            {shop ? shop.shopName : 'No Shop Created'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm">Account Status</h3>
          <p className="text-2xl font-bold text-green-600">Approved</p>
        </div>
      </div>

      {!shop && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <p>You haven't created a shop yet. Click below to get started!</p>
          <button className="btn-primary mt-2">Create Shop</button>
        </div>
      )}

      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mt-4">
        <p>Vendor dashboard features coming soon!</p>
        <p className="text-sm mt-2">Features: Shop management, product management, order tracking, revenue analytics</p>
      </div>
    </div>
  );
};

export default VendorDashboard;