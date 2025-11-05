# Epayco Payment Integration with Stripe-like Pattern

## Overview

The Epayco payment system has been integrated following the same pattern as the existing Stripe payment implementation. This ensures consistency across payment providers.

## Files Created/Modified

### 1. New API Endpoint
**`src/pages/api/v2/userInstants/create-epayco-payment.js`**
- Creates Epayco payment intent similar to Stripe's `create-payment-intent.js`
- Validates user authentication
- Checks property and token availability
- Creates payment record in database with PENDING status
- Returns payment data formatted for Epayco checkout

### 2. Updated Confirmation Endpoint
**`src/pages/api/epayco/confirmation.js`**
- Now properly updates payment records in database
- Uses extra fields (extra1, extra2, extra3) to identify payment records
- Maps Epayco status codes to database status format
- Handles both webhook (POST) and redirect (GET) scenarios

### 3. New Mutation Hook
**`src/hooks/mutation.js`**
- Added `useMutationInitiateEpaycoPayment()` hook
- Follows same pattern as `useMutationInitiatePayment()`
- Handles authentication and API calls

### 4. Updated MakePayment Component
**`src/components/Dashboard/MakePayment.jsx`**
- Now integrates with property investment flow
- Fetches payment data from API
- Displays property and payment details
- Passes data to EpaycoCheckout component

## Integration Flow

1. **User selects property and tokens** → `HeaderSection.jsx`
2. **Creates payment intent** → `useMutationInitiateEpaycoPayment()` 
3. **API creates payment record** → `/api/v2/userInstants/create-epayco-payment`
4. **MakePayment component displays checkout** → `MakePayment.jsx`
5. **User completes payment** → Epayco checkout window
6. **Epayco sends confirmation** → `/api/epayco/confirmation`
7. **Payment record updated** → Database status changed to SECCESS/FAILED

## Key Differences from Stripe

| Feature | Stripe | Epayco |
|---------|--------|--------|
| Currency | USD (cents) | COP (pesos) |
| Payment Intent | client_secret | paymentData object |
| Status Update | Webhook | Webhook + Redirect |
| Checkout | Stripe Elements | Epayco Checkout Window |

## Database Integration

The payment record includes:
- `userId`: User making the payment
- `amount`: Payment amount
- `currency`: 'cop' for Epayco
- `numberOfTokens`: Tokens being purchased
- `tokenPrice`: Price per token
- `propertyId`: Property being invested in
- `paymentIntentId`: Invoice/transaction ID
- `status`: PENDING → SECCESS/FAILED

## Configuration

### Environment Variables
```env
NEXT_PUBLIC_EPAYCO_PUBLIC_KEY=your_public_key
EPAYCO_PUBLIC_KEY=your_public_key
EPAYCO_PRIVATE_KEY=your_private_key
EPAYCO_TEST_MODE=true
```

### Currency Conversion
Currently uses a simple conversion (1 USD = 1000 COP). You should:
1. Add real-time currency conversion
2. Use ExchangeRate model if available
3. Store conversion rate in payment record

## Testing

1. **Create Payment Intent**:
   ```javascript
   POST /api/v2/userInstants/create-epayco-payment
   {
     "id": "property_id",
     "amount": 10
   }
   ```

2. **Verify Payment Record**: Check database for PENDING status

3. **Test Checkout**: Use Epayco test cards

4. **Verify Confirmation**: Check payment record updated after webhook

## Next Steps

1. ✅ Payment intent creation
2. ✅ Payment record storage
3. ✅ Confirmation webhook handling
4. ⏳ Add currency conversion
5. ⏳ Add payment success/failure notifications
6. ⏳ Integrate with token transfer (similar to Stripe flow)

## Usage Example

```javascript
// In MakePayment component
const { mutate: createEpaycoPayment } = useMutationInitiateEpaycoPayment();

createEpaycoPayment(
  { id: propertyId, amount: tokenAmount },
  {
    onSuccess: (data) => {
      // data.paymentData contains Epayco checkout data
      setProductData(data.paymentData);
    }
  }
);
```
