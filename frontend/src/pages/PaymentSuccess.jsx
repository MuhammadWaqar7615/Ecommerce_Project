import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking'); // checking, success, error
  const [message, setMessage] = useState('');

  const paymentIntentId = searchParams.get('payment_intent');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    // Verify payment was successful
    if (paymentIntentId && orderId) {
      // Payment details are in the URL, confirm success
      setStatus('success');
      setMessage('Your payment has been processed successfully!');
    } else {
      setStatus('error');
      setMessage('Payment information is missing. Please contact support.');
    }
  }, [paymentIntentId, orderId]);

  const handleViewOrder = () => {
    if (orderId) {
      navigate(`/customer/orders/${orderId}`);
    } else {
      navigate('/customer/orders');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        {status === 'checking' && (
          <div className="text-center">
            <Loader className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
            <p className="text-gray-600">Verifying your payment...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">{message}</p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Payment Intent ID:</strong>
              </p>
              <p className="text-xs font-mono text-gray-700 break-all">{paymentIntentId}</p>
              {orderId && (
                <>
                  <p className="text-sm text-gray-600 mt-3 mb-2">
                    <strong>Order ID:</strong>
                  </p>
                  <p className="text-xs font-mono text-gray-700">{orderId}</p>
                </>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-6">
              A confirmation email has been sent to your registered email address.
            </p>

            <button
              onClick={handleViewOrder}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition mb-3"
            >
              View Order Details
            </button>

            <button
              onClick={() => navigate('/customer/orders')}
              className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 rounded-lg transition"
            >
              View All Orders
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Error</h1>
            <p className="text-gray-600 mb-6">{message}</p>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition mb-3"
            >
              Return to Checkout
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 rounded-lg transition"
            >
              Go to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
