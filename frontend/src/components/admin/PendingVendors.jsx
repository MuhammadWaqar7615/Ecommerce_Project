import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { getPendingVendors, approveVendor, suspendVendor } from '../../services/admin';

const PendingVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const data = await getPendingVendors();
      setVendors(data.vendors || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vendorId) => {
    setProcessingId(vendorId);
    try {
      await approveVendor(vendorId);
      await fetchVendors();
    } catch (error) {
      alert(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSuspend = async (vendorId) => {
    if (!confirm('Are you sure you want to suspend this vendor?')) return;
    setProcessingId(vendorId);
    try {
      await suspendVendor(vendorId);
      await fetchVendors();
    } catch (error) {
      alert(error.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading vendors...</div>;
  }

  if (vendors.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>No pending vendor registrations</p>
        <p className="text-sm mt-2">All vendors have been reviewed</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Pending Vendor Approvals</h2>
      <p className="text-gray-600 mb-6">{vendors.length} vendor(s) waiting for approval</p>

      <div className="space-y-4">
        {vendors.map((vendor) => (
          <div key={vendor._id} className="border rounded-lg p-4 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{vendor.fullName}</h3>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <p><span className="text-gray-500">Username:</span> {vendor.username}</p>
                  <p><span className="text-gray-500">Email:</span> {vendor.email}</p>
                  <p><span className="text-gray-500">Phone:</span> {vendor.phone}</p>
                  <p><span className="text-gray-500">Registered:</span> {new Date(vendor.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(vendor._id)}
                  disabled={processingId === vendor._id}
                  className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                  <CheckCircle size={16} />
                  Approve
                </button>
                <button
                  onClick={() => handleSuspend(vendor._id)}
                  disabled={processingId === vendor._id}
                  className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  <XCircle size={16} />
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingVendors;