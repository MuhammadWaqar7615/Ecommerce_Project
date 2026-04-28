import React, { useState, useEffect } from 'react';
import { getAllOrders } from '../../services/admin';
import { formatPrice } from '../../utils/formatPrice';
import { ORDER_STATUS_COLORS } from '../../utils/constants';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getAllOrders();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>No orders found.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">All Orders</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium">{order.orderNumber}</td>
                <td className="px-4 py-3 text-sm">{order.customerId?.fullName || 'N/A'}</td>
                <td className="px-4 py-3 text-sm">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="text-sm">
                      {item.shopName || item.vendorName || 'Unknown'}
                    </div>
                  ))}
                </td>
                <td className="px-4 py-3 text-sm">
                  {order.items.map((item, idx) => (
                    <div key={idx}>
                      {item.quantity}x {item.productId?.name || 'Product'}
                    </div>
                  ))}
                </td>
                <td className="px-4 py-3 text-sm font-semibold">{formatPrice(order.totalAmount)}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${ORDER_STATUS_COLORS[order.status] || 'badge-info'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {new Date(order.createdAt).toLocaleDateString()}
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