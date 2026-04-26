import React, { useState, useEffect } from 'react';
import { Search, UserCheck, UserX } from 'lucide-react';
import { getAllUsers, suspendUser } from '../../services/admin';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers(1, 50, roleFilter);
      setUsers(data.users || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async (userId, currentStatus) => {
    if (!confirm(`Are you sure you want to ${currentStatus ? 'suspend' : 'activate'} this user?`)) return;
    try {
      await suspendUser(userId);
      await fetchUsers();
    } catch (error) {
      alert(error.message);
    }
  };

  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center py-10">Loading users...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">User Management</h2>
      
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input-field w-40"
        >
          <option value="">All Roles</option>
          <option value="customer">Customers</option>
          <option value="vendor">Vendors</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredUsers.map((user) => (
              <tr key={user._id}>
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                  </div>
                </td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${
                    user.role === 'admin' ? 'badge-danger' : 
                    user.role === 'vendor' ? 'badge-info' : 'badge-success'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {user.isActive ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.role !== 'admin' && (
                    <button
                      onClick={() => handleSuspend(user._id, user.isActive)}
                      className={`flex items-center gap-1 px-3 py-1 rounded text-sm ${
                        user.isActive 
                          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                    >
                      {user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                      {user.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;