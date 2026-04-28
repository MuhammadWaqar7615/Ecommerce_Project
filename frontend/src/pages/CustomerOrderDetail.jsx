import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../components/common/DashboardLayout';
import { getOrderById, cancelOrder } from '../services/order';
import { formatPrice } from '../utils/formatPrice';
import { ORDER_STATUS_COLORS } from '../utils/constants';
import { 
  Package, Truck, CheckCircle, XCircle, Clock, 
  MapPin, Calendar, CreditCard, ArrowLeft, AlertCircle 
} from 'lucide-react';

const CustomerOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const data = await getOrderById(id);
      setOrder(data.order);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }
    
    setCancelling(true);
    try {
      await cancelOrder(id, 'Cancelled by customer');
      alert('Order cancelled successfully!');
      await fetchOrderDetails();
    } catch (error) {
      alert(error.message);
    } finally {
      setCancelling(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pending': return <Clock size={20} className="text-yellow-500" />;
      case 'Processing': return <Package size={20} className="text-blue-500" />;
      case 'Shipped': return <Truck size={20} className="text-purple-500" />;
      case 'Delivered': return <CheckCircle size={20} className="text-green-500" />;
      case 'Cancelled': return <XCircle size={20} className="text-red-500" />;
      default: return <Package size={20} className="text-gray-500" />;
    }
  };

  const getStatusSteps = () => {
    const steps = ['Pending', 'Processing', 'Shipped', 'Delivered'];
    const currentIndex = steps.indexOf(order?.status);
    
    return steps.map((step, index) => ({
      name: step,
      completed: index <= currentIndex,
      active: index === currentIndex
    }));
  };

  if (loading) {
    return (
      <DashboardLayout title="Order Details" subtitle="View your order information">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !order) {
    return (
      <DashboardLayout title="Order Details" subtitle="View your order information">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Order not found'}
        </div>
      </DashboardLayout>
    );
  }

  const canCancel = order.status === 'Pending' || order.status === 'Processing';

  return (
    <DashboardLayout title="Order Details" subtitle={`Order #${order.orderNumber}`}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/customer/orders')}
        className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Orders
      </button>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Order Status</h2>
            <div className="flex items-center justify-between">
              {getStatusSteps().map((step, index) => (
                <div key={step.name} className="flex-1 text-center">
                  <div className="relative">
                    <div className={`
                      w-10 h-10 mx-auto rounded-full flex items-center justify-center
                      ${step.completed ? 'bg-primary text-white' : 'bg-gray-200 text-gray-400'}
                    `}>
                      {step.completed ? <CheckCircle size={20} /> : <Clock size={20} />}
                    </div>
                    {index < getStatusSteps().length - 1 && (
                      <div className={`
                        absolute top-5 left-1/2 w-full h-0.5
                        ${step.completed ? 'bg-primary' : 'bg-gray-200'}
                      `} />
                    )}
                  </div>
                  <p className={`text-sm mt-2 ${step.active ? 'font-semibold text-primary' : 'text-gray-500'}`}>
                    {step.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start pb-4 border-b last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.productId?.name || 'Product'}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    <p className="text-xs text-gray-400">Sold by: {item.shopId?.shopName || 'Unknown Vendor'}</p>
                  </div>
                  <p className="font-semibold text-primary">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            {/* Cancel Order Button */}
            {canCancel && (
              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Orders can only be cancelled before they are shipped.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(order.totalAmount - order.shippingFee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping Fee</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary text-lg">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              Shipping Address
            </h2>
            <div className="space-y-1 text-sm">
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.district}</p>
              <p>Postal Code: {order.shippingAddress?.postalCode || 'N/A'}</p>
            </div>
          </div>

          {/* Order Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              Order Information
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Status:</span>
                <span className={`badge ${ORDER_STATUS_COLORS[order.status]}`}>
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <span className={`badge ${order.paymentStatus === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Need Help? */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <AlertCircle size={18} />
              Need Help?
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              Have questions about your order? Contact our support team.
            </p>
            <button className="text-sm text-blue-800 underline hover:text-blue-900">
              Contact Support →
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerOrderDetail;