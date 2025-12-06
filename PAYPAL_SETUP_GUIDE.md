# PayPal Integration Setup Guide

## Overview
This guide will help you set up PayPal payments for your shop using PayPal's JavaScript SDK v6.

## Step 1: Create a PayPal Developer Account

1. Go to [PayPal Developer](https://developer.paypal.com/)
2. Sign in with your PayPal account or create one
3. Click on "Dashboard" in the top menu

## Step 2: Create an App

1. In the Dashboard, go to **Apps & Credentials**
2. Click **Create App**
3. Enter an App Name (e.g., "Portfolio Shop")
4. Select **Merchant** as the App Type
5. Click **Create App**

## Step 3: Get Your Client ID

After creating the app, you'll see:
- **Client ID** (this is what you need)
- **Secret** (for server-side operations, not needed for client-side SDK)

### Sandbox vs Live
- **Sandbox**: For testing (use sandbox Client ID)
- **Live**: For real payments (use live Client ID)

## Step 4: Configure Environment Variable

Add your PayPal Client ID to your `.env` file:

```env
VITE_PAYPAL_CLIENT_ID=your_actual_client_id_here
```

### For Vercel Deployment
Add the environment variable in Vercel:
1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add `VITE_PAYPAL_CLIENT_ID` with your Client ID

## Step 5: Testing with Sandbox

### Create Sandbox Test Accounts
1. Go to **Sandbox** → **Accounts** in PayPal Developer Dashboard
2. You'll see default Business and Personal accounts
3. Use the Personal account to test payments

### Sandbox Test Credentials
Click on any sandbox account to view:
- Email
- Password (for testing)

## How It Works

### Payment Flow
1. Customer fills in contact details
2. PayPal button appears
3. Customer clicks PayPal button
4. PayPal popup opens for authentication
5. Customer approves payment
6. Payment is captured automatically
7. Order confirmation is shown

### Features Implemented
- ✅ PayPal SDK v6 integration
- ✅ Automatic order creation
- ✅ Payment capture on approval
- ✅ Error handling
- ✅ Cancel handling
- ✅ Order details display
- ✅ Cart items passed to PayPal
- ✅ Coupon discounts applied

## Currency Support

Default currency is USD. To change:
```jsx
<PayPalButton
  amount={cartTotal}
  currency="EUR"  // Change currency here
  ...
/>
```

## Troubleshooting

### "PayPal Client ID not configured"
- Check that `VITE_PAYPAL_CLIENT_ID` is set in `.env`
- Restart the dev server after adding env variables

### "Failed to load PayPal SDK"
- Check your internet connection
- Verify the Client ID is correct
- Check browser console for errors

### Payment Not Working
- Ensure you're using Sandbox credentials for testing
- Check that the amount is greater than 0
- Verify all required fields are filled

## Security Notes

- Never expose your PayPal Secret on the client side
- The Client ID is safe to use in frontend code
- For production, always use HTTPS
- Consider implementing server-side verification for orders

## Going Live

1. Switch from Sandbox to Live in PayPal Developer Dashboard
2. Get your Live Client ID
3. Update `VITE_PAYPAL_CLIENT_ID` with the Live Client ID
4. Test with a real (small) payment
5. Deploy to production

## Support

- [PayPal Developer Docs](https://developer.paypal.com/docs/)
- [PayPal JS SDK Reference](https://developer.paypal.com/sdk/js/)
- [PayPal Community](https://www.paypal-community.com/t5/Developer-Technical-Support/bd-p/devtech)
