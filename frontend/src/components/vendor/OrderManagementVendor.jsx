import React, { useState, useEffect } from 'react';
import { getVendorOrders, updateOrderStatus } from '../../services/vendor';  // ← VENDOR service, not admin
import { formatPrice } from '../../utils/formatPrice';
import { ORDER_STATUS_COLORS } from '../../utils/constants';
import { ShoppingBag } from 'lucide-react';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getVendorOrders();  // ← Use getVendorOrders, NOT getAllOrders
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (!confirm(`Change order status to ${newStatus}?`)) return;
    
    setUpdating(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      await fetchOrders();
      alert('Order status updated!');
    } catch (error) {
      alert(error.message);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <ShoppingBag className="mx-auto mb-4" size={48} />
        <p>No orders yet. When customers order your products, they will appear here.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Customer Orders</h2>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="border rounded-lg p-4 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-semibold text-lg">Order #{order.orderNumber}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary">{formatPrice(order.totalAmount)}</p>
                <p className="text-sm text-gray-500">Customer: {order.customerId?.fullName || 'N/A'}</p>
              </div>
            </div>

            <div className="border-t pt-3 mb-3">
              <p className="font-medium mb-2">Items:</p>
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm py-1">
                  <span>{item.quantity}x {item.productId?.name || 'Product'}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <span className={`badge ${ORDER_STATUS_COLORS[order.status] || 'badge-info'}`}>
                {order.status}
              </span>
              
              {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                <select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                  disabled={updating === order._id}
                  className="input-field w-40 text-sm"
                >
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderManagement;