import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Trash2, Users,
  ChevronLeft, ChevronRight,
  Search, Filter, X, ChevronDown,
  UserCheck, UserX, Shield, Mail, Calendar
} from 'lucide-react';
import AnimatedLoader from '../common/AnimatedLoader';
import AlertConfirmation from '../common/AlertConfirmation';
import { getAllUsers, suspendUser, deleteUser } from '../../services/admin';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    type: 'warning',
    title: '',
    message: '',
    confirmText: 'Confirm',
    onConfirm: null,
    data: null
  });
  const [actionLoading, setActionLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  const tableRowVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    hover: { backgroundColor: "rgba(0,0,0,0.02)", transition: { duration: 0.2 } }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3, ease: "easeOut" } }
  };

  const filterSlide = {
    hidden: { height: 0, opacity: 0 },
    visible: { height: "auto", opacity: 1, transition: { duration: 0.25, ease: "easeInOut" } },
    exit: { height: 0, opacity: 0, transition: { duration: 0.2, ease: "easeInOut" } }
  };

  const saveScrollPosition = useCallback(() => {
    sessionStorage.setItem('userListScrollY', window.scrollY);
    sessionStorage.setItem('userListState', JSON.stringify({
      currentPage,
      searchTerm,
      roleFilter,
      statusFilter,
      sortBy,
      scrollY: window.scrollY
    }));
  }, [currentPage, searchTerm, roleFilter, statusFilter, sortBy]);

  useEffect(() => {
    const savedState = sessionStorage.getItem('userListState');
    const savedScrollY = sessionStorage.getItem('userListScrollY');

    if (savedState) {
      const state = JSON.parse(savedState);
      setCurrentPage(state.currentPage || 1);
      setSearchTerm(state.searchTerm || '');
      setRoleFilter(state.roleFilter || '');
      setStatusFilter(state.statusFilter || '');
      setSortBy(state.sortBy || 'newest');

      if (savedScrollY) {
        setTimeout(() => {
          window.scrollTo({ top: parseInt(savedScrollY), behavior: 'instant' });
        }, 100);
      }
    }

    return () => {
      sessionStorage.removeItem('userListState');
      sessionStorage.removeItem('userListScrollY');
    };
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(user =>
        statusFilter === 'active' ? user.isActive : !user.isActive
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'name_asc':
          return (a.fullName || a.username).localeCompare(b.fullName || b.username);
        case 'name_desc':
          return (b.fullName || b.username).localeCompare(a.fullName || a.username);
        default:
          return 0;
      }
    });

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [users, searchTerm, roleFilter, statusFilter, sortBy]);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers(1, 100, roleFilter);
      setUsers(data.users || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const showConfirmAlert = (type, title, message, onConfirm, data = null) => {
    setAlertConfig({
      isOpen: true,
      type,
      title,
      message,
      confirmText: type === 'danger' ? 'Delete' : type === 'suspend' ? 'Suspend' : type === 'activate' ? 'Activate' : 'Confirm',
      onConfirm: () => onConfirm(data),
      data
    });
  };

  const closeAlert = () => {
    setAlertConfig(prev => ({ ...prev, isOpen: false }));
    setTimeout(() => {
      setAlertConfig({
        isOpen: false,
        type: 'warning',
        title: '',
        message: '',
        confirmText: 'Confirm',
        onConfirm: null,
        data: null
      });
    }, 300);
  };

  const handleSuspend = async (userId, currentStatus, userName) => {
    const action = currentStatus ? 'suspend' : 'activate';
    const type = currentStatus ? 'suspend' : 'activate';
    const title = currentStatus ? 'Suspend User?' : 'Activate User?';
    const message = `Are you sure you want to ${action} "${userName}"?`;

    showConfirmAlert(type, title, message, async () => {
      setActionLoading(true);
      try {
        await suspendUser(userId);
        toast.success(`${userName} has been ${action}d successfully!`);
        await fetchUsers();
        closeAlert();
      } catch (error) {
        toast.error(error.message || `Failed to ${action} user`);
      } finally {
        setActionLoading(false);
      }
    });
  };

  const handleDelete = async (userId, userName) => {
    showConfirmAlert('danger', 'Delete User?', `This action cannot be undone! Delete "${userName}"?`, async () => {
      setActionLoading(true);
      try {
        await deleteUser(userId);
        toast.success(`${userName} has been deleted permanently!`);
        await fetchUsers();
        closeAlert();
      } catch (error) {
        toast.error(error.message || 'Failed to delete user');
      } finally {
        setActionLoading(false);
      }
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('');
    setStatusFilter('');
    setSortBy('newest');
    setIsFilterOpen(false);
    toast.info('All filters cleared');
  };

  const hasActiveFilters = searchTerm || roleFilter || statusFilter || sortBy !== 'newest';

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const suspendedUsers = users.filter(u => !u.isActive).length;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700';
      case 'vendor': return 'bg-orange-100 text-orange-700';
      case 'customer': return 'bg-teal-100 text-teal-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Shield size={12} />;
      case 'vendor': return <Users size={12} />;
      case 'customer': return <UserCheck size={12} />;
      default: return <Users size={12} />;
    }
  };

  const truncateText = (text, maxLength) => {
    if (!text) return 'N/A';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const safeText = (text) => text || 'N/A';

  const formatJoinedDate = (dateValue) => {
    if (!dateValue) return 'N/A';

    return new Date(dateValue).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <AnimatedLoader size="lg" label="Loading users..." />;
  }

  return (
    <>
      <AlertConfirmation
        isOpen={alertConfig.isOpen}
        onClose={closeAlert}
        onConfirm={alertConfig.onConfirm}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        confirmText={alertConfig.confirmText}
        cancelText="Cancel"
        loading={actionLoading}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="bg-white rounded-xl shadow-sm"
      >
        <ToastContainer position="top-right" autoClose={3000} theme="light" />

        {/* Header */}
        <motion.div variants={cardVariants} className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
        </motion.div>

        {/* Search & Filters */}
        <motion.div variants={cardVariants} className="p-4 border-b border-gray-100">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
            {searchTerm && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </motion.button>
            )}
          </div>

          <div className="flex gap-2 justify-end items-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition ${isFilterOpen || hasActiveFilters
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                }`}
            >
              <Filter size={14} />
              Filter
              {hasActiveFilters && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-0.5 w-4 h-4 bg-primary/20 text-primary rounded-full text-xs flex items-center justify-center"
                >
                  {[searchTerm, roleFilter, statusFilter].filter(Boolean).length}
                </motion.span>
              )}
              <motion.div animate={{ rotate: isFilterOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <ChevronDown size={12} />
              </motion.div>
            </motion.button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-1.5 pr-7 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary text-sm appearance-none cursor-pointer hover:border-primary transition"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="name_asc">Name A-Z</option>
                <option value="name_desc">Name Z-A</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                variants={filterSlide}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="mt-3 pt-3 border-t border-gray-100"
              >
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Role</label>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    >
                      <option value="">All</option>
                      <option value="admin">Admin</option>
                      <option value="vendor">Vendor</option>
                      <option value="customer">Customer</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    >
                      <option value="">All</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={clearFilters}
                    className="w-full px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:border-primary hover:text-primary transition"
                  >
                    Clear
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Users list */}
        <AnimatePresence mode="wait">
          {filteredUsers.length === 0 ? (
            <motion.div key="empty" variants={fadeIn} initial="hidden" animate="visible" exit="hidden" className="text-center py-12">
              <Users size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No users found</p>
            </motion.div>
          ) : (
            <motion.div key="table" variants={fadeIn} initial="hidden" animate="visible" exit="hidden">
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead className="border-b border-gray-100">
                    <tr className="text-left">
                      <th className="px-4 py-3 text-xs font-medium text-gray-500">User</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500">Email</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500">Role</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                      <th className="px-4 py-3 text-xs font-medium text-gray-500">Joined</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <AnimatePresence>
                      {currentUsers.map((user, index) => (
                        <motion.tr
                          key={user._id}
                          variants={tableRowVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover="hover"
                          transition={{ delay: index * 0.02 }}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium text-xs flex-shrink-0">
                                {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p
                                  className="text-sm font-medium text-gray-800 truncate"
                                  title={user.fullName || user.username}
                                >
                                  {safeText(user.fullName || user.username)}
                                </p>
                                <p
                                  className="text-xs text-gray-400 truncate max-w-[220px]"
                                  title={`@${user.username}`}
                                >
                                  @{safeText(user.username)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Mail size={12} className="text-gray-400 flex-shrink-0" />
                              <span
                                className="text-sm text-gray-600 truncate"
                                title={user.email}
                              >
                                {safeText(user.email)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getRoleColor(user.role)}`}>
                              {getRoleIcon(user.role)}
                              {user.role === 'admin' ? 'Admin' : user.role === 'vendor' ? 'Vendor' : 'Customer'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {user.isActive ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 whitespace-nowrap">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 whitespace-nowrap">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                Suspended
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Calendar size={12} className="text-gray-400 flex-shrink-0" />
                              <span className="text-sm text-gray-600 whitespace-nowrap">
                                {formatJoinedDate(user.createdAt)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1 flex-nowrap">
                              {user.role !== 'admin' && (
                                <>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleSuspend(user._id, user.isActive, user.fullName || user.username)}
                                    className={`p-1.5 rounded-md transition ${user.isActive ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'}`}
                                    title={user.isActive ? 'Suspend' : 'Activate'}
                                  >
                                    {user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleDelete(user._id, user.fullName || user.username)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition"
                                    title="Delete"
                                  >
                                    <Trash2 size={14} />
                                  </motion.button>
                                </>
                              )}
                              {user.role === 'admin' && (
                                <span className="text-xs text-gray-400">Admin</span>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-end items-center px-4 py-3 border-t border-gray-100"
                >
                  <div className="flex gap-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <ChevronLeft size={14} />
                    </motion.button>
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                      let pageNum;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;
                      return (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => goToPage(pageNum)}
                          className={`w-7 h-7 text-sm rounded-md transition ${currentPage === pageNum
                            ? 'bg-primary text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                          {pageNum}
                        </motion.button>
                      );
                    })}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      <ChevronRight size={14} />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default UserManagement;