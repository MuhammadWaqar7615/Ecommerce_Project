# Stripe Integration Setup Guide

This guide walks you through setting up Stripe payment processing for the Crafts & Delights e-commerce platform.

## Prerequisites

- Active Stripe account ([Create one](https://dashboard.stripe.com/register))
- Node.js and npm installed
- Backend server running

## Step 1: Get Your Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/account/apikeys)
2. You'll see two types of keys: **Public Key** and **Secret Key**
3. You'll also need the **Webhook Signing Secret**

### Key Types Explained

- **Publishable Key** (`pk_test_...` or `pk_live_...`): Used on frontend, safe to expose publicly
- **Secret Key** (`sk_test_...` or `sk_live_...`): Used on backend ONLY, keep it private
- **Webhook Secret** (`whsec_test_...` or `whsec_live_...`): Used to verify webhook signatures

## Step 2: Configure Environment Variables

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create `.env` file from the example:
```bash
cp .env.example .env
```

3. Update `.env` with your Stripe keys:
```env
# Stripe Payment Integration
STRIPE_PUBLIC_KEY=pk_test_your_public_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_test_your_webhook_secret_here
STRIPE_API_VERSION=2023-10-16
```

### Important Security Notes ⚠️

- **NEVER** commit `.env` file to git
- **NEVER** expose `STRIPE_SECRET_KEY` in frontend code
- **NEVER** share `STRIPE_WEBHOOK_SECRET` publicly
- Use test keys (`pk_test_`, `sk_test_`) during development
- Rotate keys if they are accidentally exposed

## Step 3: Backend Endpoints

### Public Endpoints

#### Get Stripe Public Key
```
GET /api/payment/public-key
```

**Response:**
```json
{
  "success": true,
  "data": {
    "publicKey": "pk_test_..."
  }
}
```

### Protected Endpoints (Require Authentication)

#### Create Payment Intent
```
POST /api/payment/create-intent
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "orderId": "order_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_...secret",
    "paymentIntentId": "pi_..."
  }
}
```

#### Process Refund
```
POST /api/payment/refund
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "orderId": "order_id_here",
  "amount": 100  // Optional: if not provided, full refund is processed
}
```

## Step 4: Webhook Configuration

### What are Webhooks?

Webhooks allow Stripe to notify your backend about payment events (success, failure, refund, etc.) in real-time.

### Setting Up Webhooks

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **"Add endpoint"**
3. Enter your webhook URL:
   - **Development:** `http://localhost:5000/api/webhook/stripe` (with ngrok for tunnel)
   - **Production:** `https://yourdomain.com/api/webhook/stripe`

4. Select events to listen to:
   - `payment_intent.succeeded` ✓
   - `payment_intent.payment_failed` ✓

5. Copy the **Webhook Signing Secret** and add it to `.env`

### Using ngrok for Local Testing

To test webhooks locally, you need to expose your local server:

1. Download [ngrok](https://ngrok.com/download)
2. Start ngrok:
```bash
ngrok http 5000
```

3. Note the forwarding URL (e.g., `https://abc123.ngrok.io`)
4. Use this in Stripe webhook URL: `https://abc123.ngrok.io/api/webhook/stripe`

## Step 5: Test the Integration

### Using Stripe Test Cards

| Card Number | Type | Result |
|------------|------|--------|
| 4242 4242 4242 4242 | Visa | Success |
| 5555 5555 5555 4444 | Mastercard | Success |
| 3782 822463 10005 | American Express | Success |
| 6011 1111 1111 1117 | Discover | Success |
| 4000 0000 0000 0002 | Always Fails | Declined |

**Other fields for test:**
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

### Testing Payment Flow

1. **Start backend server:**
```bash
npm run dev
```

2. **Start frontend:**
```bash
cd ../frontend
npm run dev
```

3. **Create a test order** through the frontend
4. **Proceed to checkout** and use a Stripe test card
5. **Verify payment** in Stripe Dashboard

## Step 6: Vendor Stripe Account Setup

For multi-vendor payouts:

1. Each vendor needs a Stripe Connect account
2. Vendors should be onboarded through your application
3. Store vendor's `stripeAccountId` in the User model

### Connected Account Flow

```
Customer Payment → Your Stripe Account → Admin Commission → Vendor Account
```

## Production Checklist

Before going live:

- [ ] Get live Stripe keys from production dashboard
- [ ] Update `.env` with live keys
- [ ] Update webhook URL to production domain
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS on your server
- [ ] Test with small amounts first
- [ ] Set up monitoring/alerts in Stripe Dashboard
- [ ] Configure retry policies for webhooks
- [ ] Document your webhook handlers

## Troubleshooting

### 1. "Missing STRIPE_SECRET_KEY" Error

**Solution:** Ensure `.env` file exists with `STRIPE_SECRET_KEY` set

```env
STRIPE_SECRET_KEY=sk_test_your_key_here
```

### 2. Webhook Not Triggering

**Solution:**
- Verify webhook URL is publicly accessible
- Check webhook signing secret matches `.env`
- Use ngrok for local testing
- View logs in Stripe Dashboard → Webhooks

### 3. "Webhook signature verification failed"

**Solution:**
- Ensure `STRIPE_WEBHOOK_SECRET` is correct
- Verify webhook body is raw, not JSON-parsed
- Check that middleware order is correct (raw body parser before JSON)

### 4. Test Payment Not Working

**Solution:**
- Use correct test card numbers (see table above)
- Verify public key is correct
- Check browser console for errors
- Verify `stripeAccountId` exists for connected accounts

## Environment Variables Reference

```env
# Required
STRIPE_PUBLIC_KEY=pk_test_...          # Frontend visible
STRIPE_SECRET_KEY=sk_test_...          # Backend only
STRIPE_WEBHOOK_SECRET=whsec_test_...   # Webhook verification

# Optional
STRIPE_API_VERSION=2023-10-16          # API version (default shown)
```

## Security Best Practices

1. **Rotate keys periodically**
2. **Use different keys for dev/staging/production**
3. **Store keys in environment variables, never in code**
4. **Enable 2FA on Stripe account**
5. **Monitor Stripe Dashboard for unusual activity**
6. **Implement rate limiting on payment endpoints**
7. **Validate all webhook signatures**
8. **Use HTTPS in production**
9. **Keep Stripe SDK updated**
10. **Review webhook logs regularly**

## Useful Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Keys Guide](https://stripe.com/docs/keys)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Connect](https://stripe.com/docs/connect)
- [Stripe Pricing](https://stripe.com/pricing)

## Support

For issues:
1. Check [Stripe Status Page](https://status.stripe.com/)
2. Review [Stripe Documentation](https://stripe.com/docs)
3. Contact [Stripe Support](https://support.stripe.com/)
