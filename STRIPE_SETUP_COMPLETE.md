# Stripe Integration - Complete Setup & Testing Guide

## Quick Start Checklist

### Backend Setup ✅
- [ ] Backend `.env` configured with Stripe keys
- [ ] `STRIPE_PUBLIC_KEY` - Publishable key
- [ ] `STRIPE_SECRET_KEY` - Secret key  
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook signing secret
- [ ] Backend server running: `npm run dev`

### Frontend Setup ✅
- [ ] Frontend dependencies installed: `npm install` ✅ Done
- [ ] Frontend `.env` configured
- [ ] `VITE_STRIPE_PUBLIC_KEY` - Same as backend public key
- [ ] `VITE_PAYMENT_SUCCESS_URL` - Payment success page URL
- [ ] `VITE_PAYMENT_CANCEL_URL` - Checkout page URL
- [ ] Frontend server running: `npm run dev`

**Note:** This implementation uses Stripe.js from CDN, not npm packages, avoiding React 19 compatibility issues.

## Getting Stripe Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/account/apikeys)
2. Copy **Publishable Key** (starts with `pk_`)
3. Copy **Secret Key** (starts with `sk_`)
4. Go to [Webhooks](https://dashboard.stripe.com/webhooks)
5. Create endpoint for `http://localhost:5000/api/webhook/stripe`
6. Copy **Signing Secret** (starts with `whsec_`)

## Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/crafts_delights
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
GOOGLE_OAUTH_CLIENT_ID=your_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_secret

# Stripe Keys
STRIPE_PUBLIC_KEY=pk_test_51Nxxx...
STRIPE_SECRET_KEY=sk_test_51Nxxx...
STRIPE_WEBHOOK_SECRET=whsec_test_xxx...
STRIPE_API_VERSION=2023-10-16
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
VITE_FRONTEND_URL=http://localhost:5173

VITE_STRIPE_PUBLIC_KEY=pk_test_51Nxxx...
VITE_PAYMENT_SUCCESS_URL=http://localhost:5173/payment-success
VITE_PAYMENT_CANCEL_URL=http://localhost:5173/checkout
```

## Testing Payment Flow

### Step 1: Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 2: Test in Browser

1. Open http://localhost:5173
2. Click "Register" or "Login"
3. Create account or login as customer
4. Browse products and add to cart
5. Go to cart and click "Checkout"
6. Fill in shipping address:
   - Street: Any address
   - City: Khanewal (default)
   - District: Optional
   - Postal Code: Optional
   - Distance: 5-10 km
7. Click "Continue to Payment"
8. Payment form appears with:
   - Card number input
   - Expiry date input
   - CVC input
9. Enter test card details:
   ```
   Card Number: 4242 4242 4242 4242
   Expiry: 12/25 (any future date)
   CVC: 123 (any 3 digits)
   ```
10. Click "Pay" button
11. Payment processes and redirects to success page
12. Success page shows:
    - Payment Intent ID
    - Order ID
    - Links to order details

### Step 3: Verify in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click "Payments" in left sidebar
3. You should see a successful payment with:
   - Amount: (from your test order)
   - Status: Succeeded
   - Payment Intent ID: pi_xxx

## API Endpoints Reference

### Payment Endpoints

#### Get Stripe Public Key
```
GET /api/payment/public-key
No authentication required

Response:
{
  "success": true,
  "data": {
    "publicKey": "pk_test_..."
  }
}
```

#### Create Payment Intent
```
POST /api/payment/create-intent
Authorization: Bearer {token}

Body:
{
  "orderId": "order_id_here"
}

Response:
{
  "success": true,
  "data": {
    "clientSecret": "pi_...secret_...",
    "paymentIntentId": "pi_..."
  }
}
```

#### Process Refund
```
POST /api/payment/refund
Authorization: Bearer {token}

Body:
{
  "orderId": "order_id_here",
  "amount": 1000  // Optional: full refund if not provided
}

Response:
{
  "success": true,
  "data": {
    "refund": { ... }
  }
}
```

## Test Card Numbers

### Success Cards
| Card | Number | Expiry | CVC |
|------|--------|--------|-----|
| Visa | 4242 4242 4242 4242 | Any future | Any 3 |
| Mastercard | 5555 5555 5555 4444 | Any future | Any 3 |
| Amex | 3782 822463 10005 | Any future | Any 4 |
| Discover | 6011 1111 1111 1117 | Any future | Any 3 |

### Decline Cards
| Card | Number | Expiry | CVC |
|------|--------|--------|-----|
| Generic Decline | 4000 0000 0000 0002 | Any future | Any 3 |

## Testing Webhook Events

To test webhooks locally, use **ngrok**:

### Setup ngrok
1. Download from [ngrok.com](https://ngrok.com/download)
2. Extract and run:
```bash
./ngrok http 5000
```
3. Copy the forwarding URL (e.g., `https://abc123.ngrok.io`)

### Configure Stripe Webhook
1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter: `https://abc123.ngrok.io/api/webhook/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy webhook signing secret
6. Add to backend `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_test_xxx...
```

### Verify Webhook Delivery
1. Make a test payment
2. Go to Stripe Webhooks dashboard
3. Click the endpoint
4. View "Events" to see:
   - payment_intent.succeeded
   - And payload details

## Complete Payment Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. CUSTOMER LOGIN                                           │
│    → Customer authenticated with JWT token                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. ADD ITEMS & CHECKOUT                                     │
│    → Navigate to checkout page                              │
│    → Fill shipping address                                  │
│    → Click "Continue to Payment"                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. CREATE ORDER (Backend)                                   │
│    POST /api/customer/orders                                │
│    ← Creates order with status "Pending"                    │
│    ← Returns orderId                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. GET STRIPE PUBLIC KEY (Backend)                          │
│    GET /api/payment/public-key                              │
│    ← Returns Stripe publishable key                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. MOUNT PAYMENT FORM (Frontend)                            │
│    → Initialize Stripe.js with public key                   │
│    → Mount CardElement                                      │
│    → Display form for card input                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. USER ENTERS CARD DETAILS                                 │
│    → Card number                                            │
│    → Expiry date                                            │
│    → CVC                                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. CREATE PAYMENT INTENT (Backend)                          │
│    POST /api/payment/create-intent                          │
│    ← stripe.paymentIntents.create()                         │
│    ← Returns clientSecret & paymentIntentId                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. CONFIRM PAYMENT (Frontend + Stripe)                      │
│    → stripe.confirmCardPayment(clientSecret, card)          │
│    ← Stripe authenticates with card issuer                  │
│    ← Returns payment status                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. WEBHOOK NOTIFICATION (Stripe → Backend)                  │
│    POST /api/webhook/stripe                                 │
│    ← payment_intent.succeeded event                         │
│    ← Backend verifies signature                             │
│    ← Updates order status to "Processing"                   │
│    ← Sets paymentStatus to "Paid"                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 10. REDIRECT TO SUCCESS (Frontend)                          │
│     → Navigate to /payment-success                          │
│     → Show payment confirmation                             │
│     → Display order details                                 │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
Ecommerce_Project/
├── backend/
│   ├── config/
│   │   ├── stripe.js              ← Stripe config
│   │   └── ...
│   ├── controllers/
│   │   ├── paymentController.js   ← Payment endpoints
│   │   └── webhookController.js   ← Webhook handler
│   ├── routes/
│   │   ├── paymentRoutes.js       ← Payment routes
│   │   └── webhookRoutes.js       ← Webhook routes
│   ├── services/
│   │   └── stripeService.js       ← Stripe helpers
│   ├── .env.example
│   ├── .env                        ← ADD YOUR KEYS HERE
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Checkout.jsx               ← Two-step checkout
│   │   │   └── PaymentSuccess.jsx         ← Success page
│   │   ├── components/
│   │   │   └── common/
│   │   │       └── StripePaymentForm.jsx  ← Payment form
│   │   ├── services/
│   │   │   └── payment.js                 ← Payment API
│   │   └── App.jsx
│   ├── .env.example
│   ├── .env                        ← ADD YOUR KEYS HERE
│   └── package.json
│
├── STRIPE_SETUP_GUIDE.md                ← Setup instructions
├── STRIPE_BACKEND_SETUP.md              ← Backend changes
├── STRIPE_FRONTEND_INTEGRATION.md       ← Frontend guide
├── STRIPE_FRONTEND_CHANGES.md           ← Frontend summary
└── STRIPE_SETUP_COMPLETE.md             ← THIS FILE
```

## Troubleshooting

### Payment Form Not Showing
- [ ] Check `VITE_STRIPE_PUBLIC_KEY` in frontend `.env`
- [ ] Verify backend is running
- [ ] Check browser console for errors
- [ ] Verify `VITE_API_URL` points to running backend

### Payment Fails Immediately
- [ ] Verify order was created (check browser network tab)
- [ ] Check backend logs for errors
- [ ] Verify `STRIPE_SECRET_KEY` in backend `.env`
- [ ] Check payment intent creation (backend logs)

### Webhook Not Triggering
- [ ] Verify webhook URL is correct in Stripe Dashboard
- [ ] For local testing, use ngrok tunnel
- [ ] Check webhook signing secret is correct
- [ ] View webhook logs in Stripe Dashboard

### "Order Not Found" Error
- [ ] Verify order creation succeeded
- [ ] Check database for created order
- [ ] Verify order ID being passed to payment form
- [ ] Check backend logs during checkout

### Redirect Loop or Blank Success Page
- [ ] Check route is defined in `App.jsx`
- [ ] Verify user is authenticated (JWT token)
- [ ] Check `VITE_PAYMENT_SUCCESS_URL` is correct
- [ ] Check browser console for errors

## Production Deployment

Before deploying to production:

### Backend
```env
NODE_ENV=production
STRIPE_PUBLIC_KEY=pk_live_xxx...
STRIPE_SECRET_KEY=sk_live_xxx...
STRIPE_WEBHOOK_SECRET=whsec_live_xxx...
FRONTEND_URL=https://your-app-domain.com
```

### Frontend
```env
VITE_API_URL=https://api.your-domain.com/api
VITE_STRIPE_PUBLIC_KEY=pk_live_xxx...
VITE_PAYMENT_SUCCESS_URL=https://your-app-domain.com/payment-success
VITE_PAYMENT_CANCEL_URL=https://your-app-domain.com/checkout
```

### Stripe Configuration
- [ ] Update webhook URL to production domain
- [ ] Switch to live keys
- [ ] Test with real test cards from Stripe
- [ ] Enable 3D Secure for fraud prevention
- [ ] Set up monitoring for failed payments
- [ ] Configure email notifications

## Support Resources

- **Stripe Dashboard:** https://dashboard.stripe.com
- **Stripe Docs:** https://stripe.com/docs
- **Stripe Testing:** https://stripe.com/docs/testing
- **Stripe Status:** https://status.stripe.com
- **Support:** https://support.stripe.com

---

**Version:** 1.0.0
**Status:** ✅ Complete
**Last Updated:** May 11, 2026
