import React, { useState, useEffect } from 'react';
import { createPaymentIntent } from '../../services/payment';
import { formatPrice } from '../../utils/formatPrice';

/**
 * Stripe Payment Form Component (using Stripe.js CDN)
 * Handles secure card payment processing via Stripe Payment Element
 */
const StripePaymentForm = ({ publicKey, orderId, total, onSuccess, onError, isLoading }) => {
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [stripe, setStripe] = useState(null);
  const [elements, setElements] = useState(null);

  // Load Stripe.js and create Elements
  useEffect(() => {
    if (!publicKey) return;

    const loadStripe = async () => {
      // Load Stripe.js from CDN
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = () => {
        const stripeInstance = window.Stripe(publicKey);
        setStripe(stripeInstance);
        
        // Create elements instance
        const elementsInstance = stripeInstance.elements();
        setElements(elementsInstance);
      };
      script.onerror = () => {
        setErrorMessage('Failed to load payment processing. Please try again.');
        onError?.(new Error('Failed to load Stripe.js'));
      };
      document.head.appendChild(script);
    };

    loadStripe();
  }, [publicKey, onError]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage('Payment form is not ready. Please try again.');
      return;
    }

    setProcessing(true);
    setErrorMessage('');

    try {
      // Create payment intent on backend
      const { clientSecret, paymentIntentId } = await createPaymentIntent(orderId);

      // Get card element
      const cardElement = elements.getElement('card');

      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed. Please try again.');
        onError?.(error);
      } else if (paymentIntent.status === 'succeeded') {
        // Payment successful - redirect with details
        const redirectUrl = `${import.meta.env.VITE_PAYMENT_SUCCESS_URL}?payment_intent=${paymentIntentId}&order_id=${orderId}`;
        console.log("redirect url", redirectUrl)
        onSuccess?.(redirectUrl);
      } else {
        setErrorMessage(`Payment status: ${paymentIntent.status}`);
        onError?.(new Error(`Unexpected payment status: ${paymentIntent.status}`));
      }
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred during payment');
      onError?.(error);
    } finally {
      setProcessing(false);
    }
  };

  if (!stripe || !elements) {
    return (
      <div className="bg-gray-50 p-8 rounded-lg text-center">
        <p className="text-gray-600">Loading payment form...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <CardElementWrapper elements={elements} disabled={processing || isLoading} />
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 text-sm">{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={processing || isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition"
      >
        {processing ? 'Processing payment...' : `Pay ${formatPrice(total)}`}
      </button>

      <p className="text-xs text-gray-500 text-center">
        💳 Payment is processed securely by Stripe
      </p>
    </form>
  );
};

/**
 * Card Element Wrapper Component
 * Renders Stripe Card Element with styling
 */
const CardElementWrapper = ({ elements, disabled }) => {
  const containerRef = React.useRef(null);
  const cardRef = React.useRef(null);
  const isCreatedRef = React.useRef(false);

  React.useEffect(() => {
    if (!elements || !containerRef.current) return;

    // Only create card element once
    if (!isCreatedRef.current && !cardRef.current) {
      try {
        const cardElement = elements.create('card', {
          style: {
            base: {
              fontSize: '16px',
              color: '#424770',
              '::placeholder': {
                color: '#aab7c4',
              },
            },
            invalid: {
              color: '#fa755a',
            },
          },
        });
        cardElement.mount(containerRef.current);
        cardRef.current = cardElement;
        isCreatedRef.current = true;
      } catch (error) {
        console.error('Error creating card element:', error);
      }
    }

    return () => {
      // Don't unmount on re-render, only on cleanup
      // Keep the element mounted for the lifetime of the form
    };
  }, [elements]);

  // Update disabled state without recreating
  React.useEffect(() => {
    if (cardRef.current) {
      // Stripe elements don't have a direct disabled property,
      // but we can handle this at the form level
    }
  }, [disabled]);

  return <div ref={containerRef} className="py-2" />;
};

export default StripePaymentForm;
