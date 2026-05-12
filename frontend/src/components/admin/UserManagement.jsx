import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Filter, X, ChevronDown, Edit, Trash2,
  Users, UserCheck, UserX, Shield, ShoppingBag, TrendingUp,
  ChevronLeft, ChevronRight
} from 'lucide-react';
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

  const navigate = useNavigate();
  const location = useLocation();

  // Save scroll position before navigating away
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

  // Restore scroll position when coming back
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
  }, [roleFilter, statusFilter]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(user =>
        statusFilter === 'active' ? user.isActive : !user.isActive
      );
    }

    // Sorting
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

  const handleSuspend = async (userId, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'suspend' : 'activate'} this user?`)) return;
    try {
      await suspendUser(userId);
      toast.success(`User ${currentStatus ? 'suspended' : 'activated'} successfully!`);
      await fetchUsers();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!confirm(`⚠️ Permanently delete "${userName}"?\n\nThis action cannot be undone!`)) return;
    try {
      await deleteUser(userId);
      toast.success('User deleted permanently!');
      await fetchUsers();
    } catch (error) {
      toast.error(error.message);
    }
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

  // Statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.isActive).length;
  const suspendedUsers = users.filter(u => !u.isActive).length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const vendorCount = users.filter(u => u.role === 'vendor').length;
  const customerCount = users.filter(u => u.role === 'customer').length;

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800">User Management</h2>
        </div>
      </div>


      {/* Search and Filters Bar */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, email or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition ${isFilterOpen || hasActiveFilters
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
          >
            <Filter size={18} />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 w-5 h-5 bg-white text-primary rounded-full text-xs flex items-center justify-center">
                {[searchTerm, roleFilter, statusFilter].filter(Boolean).length}
              </span>
            )}
            <ChevronDown size={16} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>
        </div>

        {/* Expanded Filters */}
        {isFilterOpen && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Role Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="vendor">Vendor</option>
                  <option value="customer">Customer</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              {/* Filter Actions */}
              <div className="flex items-end gap-2">
                <button
                  onClick={clearFilters}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Users size={40} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No users found</h3>
          <p className="text-gray-500 mb-6">
            {hasActiveFilters ? 'Try adjusting your filters' : 'No users registered yet'}
          </p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn-primary inline-flex items-center gap-2">
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-2 pl-14 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors duration-200 group">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs ${user.role === 'admin' ? 'bg-purple-500' :
                            user.role === 'vendor' ? 'bg-orange-500' : 'bg-teal-500'
                          }`}>
                          {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{user.fullName}</p>
                          <p className="text-xs text-gray-400">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'vendor' ? 'bg-orange-100 text-orange-700' : 'bg-teal-100 text-teal-700'
                        }`}>
                        {user.role === 'admin' && 'Admin'}
                        {user.role === 'vendor' && 'Vendor'}
                        {user.role === 'customer' && 'Customer'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <p className="text-xs text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('en-PK', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center justify-center gap-1">
                        {user.role !== 'admin' && (
                          <>
                            <button
                              onClick={() => handleSuspend(user._id, user.isActive)}
                              className={`p-1.5 rounded-lg transition-all duration-200 ${user.isActive
                                  ? 'text-yellow-500 hover:bg-yellow-50'
                                  : 'text-green-500 hover:bg-green-50'
                                }`}
                              title={user.isActive ? 'Suspend User' : 'Activate User'}
                            >
                              {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                            </button>
                            <button
                              onClick={() => handleDelete(user._id, user.fullName)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Delete User"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                        {user.role === 'admin' && (
                          <span className="text-xs text-gray-400 italic">Protected</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                <span className="font-medium">{Math.min(indexOfLastItem, filteredUsers.length)}</span> of{' '}
                <span className="font-medium">{filteredUsers.length}</span> users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex gap-1">
                  {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => goToPage(pageNum)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition ${currentPage === pageNum
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
    </div>
  );
};

export default UserManagement;