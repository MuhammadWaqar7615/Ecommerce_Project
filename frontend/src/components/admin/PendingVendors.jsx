import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Store, Mail, Phone, Calendar, User, AlertCircle } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AnimatedLoader from '../common/AnimatedLoader';
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
      toast.error('Failed to load pending vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vendorId, vendorName) => {
    setProcessingId(vendorId);
    try {
      await approveVendor(vendorId);
      toast.success(`${vendorName} has been approved successfully!`);
      await fetchVendors();
    } catch (error) {
      toast.error(error.message || 'Failed to approve vendor');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (vendorId, vendorName) => {
    setProcessingId(vendorId);
    try {
      await suspendVendor(vendorId);
      toast.success(`${vendorName} has been rejected`);
      await fetchVendors();
    } catch (error) {
      toast.error(error.message || 'Failed to reject vendor');
    } finally {
      setProcessingId(null);
    }
  };

  const toggleAccordion = (id) => {
    setOpenId(openId === id ? null : id);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const accordionVariants = {
    collapsed: { height: 0, opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } },
    expanded: { height: "auto", opacity: 1, transition: { duration: 0.4, ease: "easeOut" } }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <AnimatedLoader size="lg" label="Loading pending vendors..." />
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className="w-20 h-20 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-4"
        >
          <CheckCircle size={40} className="text-green-500" />
        </motion.div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Pending Vendors</h3>
        <p className="text-gray-500">All vendor registrations have been reviewed</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme="light" 
      />

      {/* Header */}
      <motion.div variants={cardVariants} className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
            <Store size={20} className="text-yellow-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Pending Vendor Approvals</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {vendors.length} vendor{vendors.length !== 1 ? 's' : ''} waiting for review
            </p>
          </div>
        </div>
      </motion.div>

      {/* Vendors List */}
      <div className="space-y-4">
        <AnimatePresence>
          {vendors.map((vendor, index) => (
            <motion.div
              key={vendor._id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              {/* Accordion Header */}
              <motion.div
                whileHover={{ backgroundColor: "rgba(0,0,0,0.01)" }}
                className="p-5 cursor-pointer transition-colors"
                onClick={() => toggleAccordion(vendor._id)}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h3 className="font-semibold text-lg text-gray-800">{vendor.fullName}</h3>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        <AlertCircle size={12} />
                        Pending Review
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        @{vendor.username}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail size={12} />
                        {vendor.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone size={12} />
                        {vendor.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        Registered: {new Date(vendor.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(vendor._id, vendor.fullName);
                      }}
                      disabled={processingId === vendor._id}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 text-sm font-medium"
                    >
                      {processingId === vendor._id ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <CheckCircle size={16} />
                      )}
                      Approve
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReject(vendor._id, vendor.fullName);
                      }}
                      disabled={processingId === vendor._id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 text-sm font-medium"
                    >
                      <XCircle size={16} />
                      Reject
                    </motion.button>
                    
                    <motion.div
                      animate={{ rotate: openId === vendor._id ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-gray-400"
                    >
                      <ChevronDown size={20} />
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Accordion Body - User Data Only */}
              <AnimatePresence>
                {openId === vendor._id && (
                  <motion.div
                    variants={accordionVariants}
                    initial="collapsed"
                    animate="expanded"
                    exit="collapsed"
                    className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white overflow-hidden"
                  >
                    <div className="p-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Personal Information */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <User size={16} className="text-primary" />
                            Personal Information
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm text-gray-500">Full Name</span>
                              <span className="text-sm font-medium text-gray-800">{vendor.fullName}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm text-gray-500">Username</span>
                              <span className="text-sm font-medium text-gray-800">{vendor.username}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm text-gray-500">Email Address</span>
                              <span className="text-sm font-medium text-gray-800">{vendor.email}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm text-gray-500">Phone Number</span>
                              <span className="text-sm font-medium text-gray-800">{vendor.phone}</span>
                            </div>
                          </div>
                        </div>

                        {/* Account Information */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Calendar size={16} className="text-primary" />
                            Account Information
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm text-gray-500">User ID</span>
                              <span className="text-sm font-medium text-gray-800">{vendor._id}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm text-gray-500">Account Type</span>
                              <span className="text-sm font-medium text-gray-800">Vendor</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm text-gray-500">Registration Date</span>
                              <span className="text-sm font-medium text-gray-800">
                                {new Date(vendor.createdAt).toLocaleDateString('en-PK', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-sm text-gray-500">Status</span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                                <AlertCircle size={10} />
                                Pending
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default PendingVendors;