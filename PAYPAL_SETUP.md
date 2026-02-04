# PayPal Payment Integration Setup

## Overview
This application now supports PayPal payment processing for both subscription plans and coin purchases.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# PayPal Client ID (public)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id_here

# PayPal Secret (server-side only)
PAYPAL_SECRET=your_paypal_secret_here

# PayPal API Base URL
# For Sandbox (testing):
PAYPAL_API_BASE=https://api-m.sandbox.paypal.com

# For Production:
# PAYPAL_API_BASE=https://api-m.paypal.com

# Optional: App URL (for return URLs)
NEXT_PUBLIC_APP_URL=http://localhost:3000
# For production:
# NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Getting PayPal Credentials

### 1. Create a PayPal Developer Account
1. Go to [https://developer.paypal.com/](https://developer.paypal.com/)
2. Log in with your PayPal account or create a new one
3. Navigate to the Dashboard

### 2. Create an App
1. Click "Create App" in the dashboard
2. Give your app a name (e.g., "ViCraft")
3. Select "Seller" as the app type
4. Click "Create App"

### 3. Get Your Credentials
After creating the app, you'll see:
- **Client ID**: Copy this to `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
- **Secret**: Copy this to `PAYPAL_SECRET`

### 4. Configure Webhook (Optional)
For production, set up a webhook to receive payment notifications:
1. In your app settings, click "Add Webhook"
2. Enter your webhook URL: `https://yourdomain.com/api/payments/webhook`
3. Select webhook events:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.DENIED`

## Testing in Sandbox Mode

PayPal sandbox mode is enabled by default with `PAYPAL_API_BASE=https://api-m.sandbox.paypal.com`.

### Test Accounts
1. In PayPal Developer Dashboard, go to "Accounts" under "Sandbox"
2. Use the pre-created test accounts or create new ones
3. Log in to [https://www.sandbox.paypal.com/](https://www.sandbox.paypal.com/) with test credentials

### Test Flow
1. Click "Subscribe" or "Purchase Coins" in the app
2. You'll be redirected to PayPal sandbox
3. Log in with test account credentials
4. Approve the payment
5. You'll be redirected back to the app with success message

## Production Setup

When ready to go live:

1. **Update API Base URL**:
   ```bash
   PAYPAL_API_BASE=https://api-m.paypal.com
   ```

2. **Use Production Credentials**:
   - Create a new app in "Live" mode in PayPal Developer Dashboard
   - Update `NEXT_PUBLIC_PAYPAL_CLIENT_ID` and `PAYPAL_SECRET` with live credentials

3. **Update App URL**:
   ```bash
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

4. **Verify Webhook**:
   - Set up webhook in production app settings
   - Test with small amounts first

## Payment Flow

1. User clicks "Subscribe" or "Purchase Coins" button
2. Frontend calls `/api/payments/create-order`
3. Backend creates PayPal order and returns approval URL
4. User is redirected to PayPal to approve payment
5. After approval, PayPal redirects to `/payment/return`
6. Frontend calls `/api/payments/capture-order` with PayPal order ID
7. Backend captures payment and updates user coins/subscription
8. User sees success message and is redirected to user page

## Troubleshooting

### Error: "Failed to create PayPal order"
- Check that `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET` are correct
- Verify `PAYPAL_API_BASE` is set correctly
- Check browser console and server logs for details

### Error: "Payment parameters missing"
- Ensure PayPal is redirecting back with `token` parameter
- Check return URL configuration in PayPal app settings

### Order not updating after payment
- Check server logs for capture-order errors
- Verify database connection and order table exists
- Check that `paypal_order_id` is being stored correctly

## Database Schema

The following tables are used for payment processing:

### `orders` table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL, -- 'subscription' or 'coins'
  amount DECIMAL NOT NULL,
  coins INTEGER,
  subscription_type TEXT, -- 'lite', 'pro', or 'max'
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  paypal_order_id TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Security Notes

- Never commit `PAYPAL_SECRET` to version control
- Always use HTTPS in production
- Implement webhook signature verification for production
- Use environment variables for all sensitive data
- The `NEXT_PUBLIC_` prefix makes variables available on the client side
- Only `PAYPAL_SECRET` should remain server-side only
