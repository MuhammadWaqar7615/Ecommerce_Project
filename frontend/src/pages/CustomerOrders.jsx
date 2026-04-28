import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/common/DashboardLayout';
import { getOrders } from '../services/order';
import { formatPrice } from '../utils/formatPrice';
import { ORDER_STATUS_COLORS } from '../utils/constants';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, Truck, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pending': return <Clock size={16} className="text-yellow-500" />;
      case 'Processing': return <Package size={16} className="text-blue-500" />;
      case 'Shipped': return <Truck size={16} className="text-purple-500" />;
      case 'Delivered': return <CheckCircle size={16} className="text-green-500" />;
      case 'Cancelled': return <XCircle size={16} className="text-red-500" />;
      default: return <Package size={16} className="text-gray-500" />;
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status.toLowerCase() === filter.toLowerCase());

  if (loading) {
    return (
      <DashboardLayout title="My Orders" subtitle="View all your orders">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Orders" subtitle="View all your orders">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg capitalize transition-colors ${
              filter === status
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <ShoppingBag className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-500">No orders found.</p>
          <Link to="/products" className="btn-primary inline-block mt-4">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 border-b flex flex-wrap justify-between items-center gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
                  <p className="text-xs text-gray-400">
                    Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(order.status)}
                  <span className={`badge ${ORDER_STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.productId?.name || 'Product'}</p>
                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                        <p className="text-xs text-gray-400">Vendor: {item.shopId?.shopName || 'Unknown'}</p>
                      </div>
                      <p className="font-semibold text-primary">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-4 pt-4 border-t flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Shipping Address</p>
                    <p className="text-sm">{order.shippingAddress?.street}</p>
                    <p className="text-sm">{order.shippingAddress?.city}, {order.shippingAddress?.district}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Subtotal: {formatPrice(order.totalAmount - order.shippingFee)}</p>
                    <p className="text-sm text-gray-500">Shipping: {formatPrice(order.shippingFee)}</p>
                    <p className="text-xl font-bold text-primary mt-1">{formatPrice(order.totalAmount)}</p>
                  </div>
                </div>

                {/* View Details Button */}
                <div className="mt-4 pt-4 border-t flex justify-end">
                  <Link
                    to={`/customer/orders/${order._id}`}
                    className="flex items-center gap-2 px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
                  >
                    <Eye size={16} />
                    View Order Details
                  </Link>
                </div>

                {/* Order Timeline (if delivered or shipped) */}
                {order.status === 'Shipped' && order.trackingNumber && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      📦 Tracking Number: {order.trackingNumber}
                    </p>
                  </div>
                )}

                {order.status === 'Delivered' && order.deliveredAt && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✅ Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default CustomerOrders;