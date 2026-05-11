# Frontend Stripe Integration - Setup Guide

## Overview

The frontend Stripe integration enables customers to securely pay for orders using Stripe's payment processing. The payment flow is integrated into the checkout process with a two-step form:

1. **Shipping Step** - Collect shipping address and distance
2. **Payment Step** - Collect card details and process payment

**Note:** This implementation uses Stripe.js loaded directly from Stripe's CDN, eliminating npm dependency conflicts while maintaining full Stripe functionality.

## Environment Setup

### 1. Install Dependencies

First, install the frontend dependencies:

```bash
cd frontend
npm install
```

All required packages are already configured in `package.json`.

**Note:** This integration uses Stripe.js loaded directly from Stripe's CDN (https://js.stripe.com/v3/), which eliminates npm dependency conflicts and ensures you always have the latest Stripe features. No Stripe npm packages are required.

### 2. Configure Environment Variables

Create a `.env` file in the frontend directory from `.env.example`:

```bash
cp .env.example .env
```

Update `.env` with your Stripe configuration:

```env
# Base backend API URL
VITE_API_URL=http://localhost:5000/api

# Frontend URL (for email links, etc.)
VITE_FRONTEND_URL=http://localhost:5173

# Stripe Publishable Key (get from https://dashboard.stripe.com/account/apikeys)
VITE_STRIPE_PUBLIC_KEY=pk_test_your_public_key_here

# Payment success redirect URL (your frontend payment success page)
VITE_PAYMENT_SUCCESS_URL=http://localhost:5173/payment-success

# Payment cancelled redirect URL (back to checkout)
VITE_PAYMENT_CANCEL_URL=http://localhost:5173/checkout
```

## Components

### 1. StripePaymentForm Component

**Location:** `src/components/common/StripePaymentForm.jsx`

A reusable Stripe payment form component that handles:
- Loading Stripe.js library from CDN
- Creating Stripe elements (card input)
- Creating payment intents
- Confirming payments with Stripe

**Implementation Details:**
- Loads Stripe.js from CDN on mount (https://js.stripe.com/v3/)
- Uses `stripe.elements()` to create an elements instance
- Mounts a card element into the DOM
- Handles payment confirmation via `stripe.confirmCardPayment()`

**Usage:**

```jsx
import StripePaymentForm from '../components/common/StripePaymentForm';

<StripePaymentForm
  publicKey={stripePublicKey}
  orderId={orderId}
  total={total}
  onSuccess={(redirectUrl) => navigate(redirectUrl)}
  onError={(error) => console.error(error)}
  isLoading={false}
/>
```

**Props:**
- `publicKey` (string) - Stripe publishable key
- `orderId` (string) - Order ID from backend
- `total` (number) - Total amount in PKR
- `onSuccess` (function) - Called on successful payment with redirect URL
- `onError` (function) - Called on payment error
- `isLoading` (boolean) - Disable form while loading

### 2. PaymentSuccess Page

**Location:** `src/pages/PaymentSuccess.jsx`

Displays payment success confirmation with:
- Payment intent ID
- Order ID
- Links to view order details
- Links to view all orders

**Route:** `/payment-success?payment_intent=pi_...&order_id=...`

## Services

### Payment Service

**Location:** `src/services/payment.js`

Provides API communication with backend payment endpoints:

#### `getStripePublicKey()`
Fetches the Stripe public key from backend.

```javascript
const publicKey = await getStripePublicKey();
```

#### `createPaymentIntent(orderId)`
Creates a payment intent on the backend.

```javascript
const { clientSecret, paymentIntentId } = await createPaymentIntent(orderId);
```

#### `processRefund(orderId, amount)`
Processes a refund for an order.

```javascript
const refund = await processRefund(orderId, 1000);
```

## Checkout Flow

### Step 1: Shipping Information

User enters:
- Street address
- City
- District (optional)
- Postal code (optional)
- Distance from Khanewal

On submission:
- Order is created on backend with status "Pending"
- Order receives a unique ID
- UI switches to payment step

### Step 2: Payment

User enters:
- Card number
- Card expiry
- CVC

On submission:
- Payment intent is created on backend
- Card is validated with Stripe
- If successful, user is redirected to success page
- If failed, error message is displayed

### Step 3: Success

User sees:
- Payment confirmation
- Order details
- Links to view order

## Stripe Elements Styling

The Card Element is created with styling to match your application:

```javascript
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
  disabled: disabled,
});
```

You can customize colors, fonts, and other styles by modifying the options in the `CardElementWrapper` component in `StripePaymentForm.jsx`.

For more styling options, see [Stripe Card Element Styles Documentation](https://stripe.com/docs/stripe-js/reference#card-element-options).

## Testing Payment Flow

### 1. Using Stripe Test Cards

Use these test cards during development:

| Card Number | Type | Result |
|------------|------|--------|
| 4242 4242 4242 4242 | Visa | Success |
| 5555 5555 5555 4444 | Mastercard | Success |
| 3782 822463 10005 | American Express | Success |
| 6011 1111 1111 1117 | Discover | Success |
| 4000 0000 0000 0002 | Visa (Declined) | Decline |

**Other fields for test:**
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)

### 2. Testing Locally

1. **Start backend:**
```bash
cd backend
npm run dev
```

2. **Start frontend:**
```bash
cd frontend
npm run dev
```

3. **Login as customer** and navigate to checkout

4. **Add items to cart** if not already there

5. **Fill in shipping address** and click "Continue to Payment"

6. **Enter test card details** and click "Pay"

7. **Verify success page** appears with payment details

### 3. Testing with ngrok (Webhook Testing)

For webhook testing locally:

1. **Start ngrok:**
```bash
ngrok http 5173  # For frontend
```

2. **Update Stripe webhook URL** in Stripe Dashboard to your ngrok URL

3. **Verify webhook events** are being received by backend

## Troubleshooting

### "Failed to load Stripe key" Error

**Cause:** Backend public key endpoint is not accessible

**Solution:**
- Ensure backend is running: `npm run dev` in backend folder
- Check `VITE_API_URL` in `.env` is correct
- Verify network connectivity between frontend and backend

### Card Payment Fails with "Your card was declined"

**Cause:** Using a declined test card or invalid test data

**Solution:**
- Use a valid test card from the list above (4242 is most common)
- Use any future expiry date
- Use any 3-digit CVC

### Blank/Empty Payment Form

**Cause:** Stripe public key is not set or invalid

**Solution:**
- Verify `VITE_STRIPE_PUBLIC_KEY` in `.env`
- Ensure it starts with `pk_test_` or `pk_live_`
- Check browser console for errors
- Verify backend `/api/payment/public-key` endpoint works

### "Order not found" Error During Payment

**Cause:** Order creation failed or order ID is incorrect

**Solution:**
- Check backend logs for order creation errors
- Ensure shipping form submission completed successfully
- Verify order was created in database

### Redirect Loop or Stuck on Payment Page

**Cause:** Payment success callback is not working

**Solution:**
- Check browser console for JavaScript errors
- Verify `VITE_PAYMENT_SUCCESS_URL` in `.env`
- Ensure `/payment-success` route is defined in App.jsx

## Security Considerations

✅ **Implemented:**
- Card details never sent to your server (Stripe Elements)
- Stripe tokenization handles PCI compliance
- HTTPS recommended for production
- Public key safe to expose in frontend
- Secret operations handled on backend only

⚠️ **Best Practices:**
- Never log or store sensitive payment data
- Always use HTTPS in production
- Keep Stripe.js library updated
- Validate amounts on backend before processing
- Implement rate limiting on payment endpoints

## Stripe Elements Documentation

For advanced customization, see:
- [Stripe Elements Documentation](https://stripe.com/docs/stripe-js/elements)
- [Card Element Reference](https://stripe.com/docs/js/element_types/card)
- [Stripe React Library](https://stripe.com/docs/stripe-js/react)

## Production Deployment

Before deploying to production:

- [ ] Update all environment variables with production keys
- [ ] Change `VITE_PAYMENT_SUCCESS_URL` and `VITE_PAYMENT_CANCEL_URL` to production domain
- [ ] Enable HTTPS on your server
- [ ] Run `npm run build` and test the built version
- [ ] Configure Stripe webhook to production domain
- [ ] Test payment flow with real test cards
- [ ] Enable Stripe security features (3D Secure, etc.)
- [ ] Set up monitoring/alerts for failed payments
- [ ] Document payment failure handling process

## Environment Variables Reference

```env
VITE_API_URL                    # Backend API base URL
VITE_FRONTEND_URL               # Frontend app URL
VITE_STRIPE_PUBLIC_KEY          # Stripe publishable key (starts with pk_)
VITE_PAYMENT_SUCCESS_URL        # Redirect URL after successful payment
VITE_PAYMENT_CANCEL_URL         # Redirect URL if payment is cancelled
```

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── common/
│   │       └── StripePaymentForm.jsx      # Stripe payment form
│   ├── pages/
│   │   ├── Checkout.jsx                   # Two-step checkout (shipping + payment)
│   │   └── PaymentSuccess.jsx             # Payment success confirmation
│   ├── services/
│   │   └── payment.js                     # Payment API service
│   └── App.jsx                            # Routes setup
├── .env.example                           # Environment variables template
└── package.json                           # Dependencies (includes Stripe packages)
```

## Support & Resources

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe API Documentation](https://stripe.com/docs)
- [Stripe React Library](https://stripe.com/docs/stripe-js/react)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Support](https://support.stripe.com/)
