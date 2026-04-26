import React, { useState, useEffect } from 'react';
import { Search, Eye } from 'lucide-react';
import { getAllOrders } from '../../services/admin';
import { formatPrice } from '../../utils/formatPrice';
import { ORDER_STATUS, ORDER_STATUS_COLORS } from '../../utils/constants';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const data = await getAllOrders(1, 100, statusFilter);
      setOrders(data.orders || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center py-10">Loading orders...</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Order Management</h2>
      
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by order number or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-40"
        >
          <option value="">All Status</option>
          {Object.values(ORDER_STATUS).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredOrders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                <td className="px-4 py-3">{order.customerId?.fullName || 'N/A'}</td>
                <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">{formatPrice(order.totalAmount)}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${ORDER_STATUS_COLORS[order.status] || 'badge-info'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${order.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                    {order.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderManagement;