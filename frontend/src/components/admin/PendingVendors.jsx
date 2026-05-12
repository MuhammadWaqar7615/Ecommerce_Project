import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { getPendingVendors, approveVendor, suspendVendor } from '../../services/admin';

const PendingVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [openId, setOpenId] = useState(null);

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

  const handleReject = async (vendorId) => {
    if (!confirm('Are you sure you want to reject this vendor?')) return;
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

  const toggleAccordion = (id) => {
    setOpenId(openId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">No Pending Vendors</h3>
        <p className="text-gray-500">All vendor registrations have been reviewed</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Pending Vendor Approvals</h2>
        <p className="text-sm text-gray-500 mt-1">
          {vendors.length} vendor{vendors.length !== 1 ? 's' : ''} waiting for review
        </p>
      </div>

      <div className="space-y-4">
        {vendors.map((vendor) => (
          <div key={vendor._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Accordion Header - Theme Background */}
            <div
              className="p-4 cursor-pointer transition flex justify-between items-center bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10"
              onClick={() => toggleAccordion(vendor._id)}
            >
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-800">{vendor.fullName}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprove(vendor._id);
                  }}
                  disabled={processingId === vendor._id}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 text-sm"
                >
                  <CheckCircle size={15} />
                  Approve
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReject(vendor._id);
                  }}
                  disabled={processingId === vendor._id}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 text-sm"
                >
                  <XCircle size={15} />
                  Reject
                </button>
                {openId === vendor._id ? (
                  <ChevronUp size={20} className="text-gray-500" />
                ) : (
                  <ChevronDown size={20} className="text-gray-500" />
                )}
              </div>
            </div>

            {/* Accordion Body */}
            {openId === vendor._id && (
              <div className="border-t border-gray-100 p-4 bg-white">
                <div className="flex justify-between  gap-3 text-sm">
                  <div className="flex flex-col py-2 border-b border-gray-50">
                    <div className='flex justify-start gap-1'>
                      <span className="text-gray-500">Username:</span>
                      <span className="font-medium text-gray-700">{vendor.username}</span>
                    </div>
                    <div className='flex justify-start gap-1'>
                      <span className="text-gray-500">Email:</span>
                      <span className="font-medium text-gray-700">{vendor.email}</span>
                    </div>
                  </div>
                  <div className="flex flex-col py-2 border-b border-gray-50">
                    <div className='flex justify-between gap-1'>
                      <span className="text-gray-500">Phone:</span>
                      <span className="font-medium text-gray-700">{vendor.phone}</span>
                    </div>
                    <div className='flex justify-between gap-1'>
                      <span className="text-gray-500">Registered:</span>
                      <span className="font-medium text-gray-700">{new Date(vendor.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingVendors;