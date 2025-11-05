import { useState, useEffect } from 'react';
import CheckoutComponent from '@/components/Checkout';
import { useMutationInitiatePayment } from '@/hooks/mutation';
import { usePropertyStates } from '@/store/useProduct';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';
import * as config from '@/config';

// Load Stripe outside of component to avoid recreating on every render
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51OqeOYGUpSubT3GbqdYLrzRmhRyFNcYLcKjYRt5gTnZplQo4K7QPIBkd7mEoLzdyKiA97YAIINAp6FljxNkfNTfR00WMYiS7Rt',
);

export default function MakePayment({ selectedNFT, amount, handleNext }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const initailPropert = usePropertyStates((state) => state.initailPropert);
  const setInitailPropert = usePropertyStates((state) => state.setInitailPropert);

  // Create payment intent for Stripe
  const onSuccess = () => {
    setLoading(false);
  };

  const { mutate: createPaymentIntent, isPending: isCreatingPayment } = useMutationInitiatePayment(onSuccess);

  useEffect(() => {
    // If we already have payment intent (client_secret), don't create again
    if (initailPropert?.init) {
      setLoading(false);
      return;
    }

    // Otherwise, create new payment intent
    if (selectedNFT?.id && amount && !loading && !isCreatingPayment) {
      setLoading(true);
      createPaymentIntent({ id: selectedNFT.id, amount: Number(amount) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNFT?.id, amount]);

  const handleModal = () => {
    // Payment successful, navigate to property details page
    if (selectedNFT?.id) {
      router.push(`/dashboard/market-place/${selectedNFT.id}`);
    } else if (handleNext) {
      // Fallback to next step if property ID is not available
      handleNext();
    }
  };

  // Calculate payment amount
  const paymentAmount = selectedNFT?.tokenPrice ? Number(amount) * selectedNFT.tokenPrice : 0;
  // Convert to cents for Stripe (amount must be in smallest currency unit)
  const amountInCents = Math.round(paymentAmount * 100);

  const options = {
    appearance: {
      variables: {
        colorIcon: '#6772e5',
        fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
      },
    },
    currency: config.CURRENCY || 'usd',
    mode: 'payment',
    // Amount in cents (smallest currency unit)
    amount: amountInCents,
  };

  if (loading || isCreatingPayment) {
    return (
      <div className='container mx-auto p-8'>
        <div className='flex items-center justify-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
          <p className='ml-4'>Preparing payment...</p>
        </div>
      </div>
    );
  }

  if (!initailPropert?.init) {
    return (
      <div className='container mx-auto p-8'>
        <div className='bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded'>
          <p>Unable to load payment details. Please try again.</p>
        </div>
      </div>
    );
  }

  // Ensure we have a valid amount before rendering Stripe Elements
  if (!amountInCents || amountInCents <= 0 || isNaN(amountInCents)) {
    return (
      <div className='container mx-auto p-8'>
        <div className='bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded'>
          <p>Invalid payment amount. Please check your selection.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-8'>
      <h1 className='text-2xl font-bold mb-6'>Payment Checkout</h1>

      <div className='bg-white/20 p-6 rounded-lg shadow-md mb-8'>
        <h2 className='text-xl font-semibold mb-4'>Property Investment Details</h2>
        <div className='mb-4 text-gray-700'>
          <p>
            <strong>Property:</strong> {selectedNFT?.name}
          </p>
          <p>
            <strong>Number of Tokens:</strong> {amount}
          </p>
          <p>
            <strong>Token Price:</strong> ${selectedNFT?.tokenPrice?.toLocaleString() || '0'}
          </p>
          <p>
            <strong>Total Amount:</strong> ${paymentAmount.toLocaleString()} USD
          </p>
        </div>

        <Elements stripe={stripePromise} options={options}>
          <CheckoutComponent
            id={selectedNFT?.id}
            handleModal={handleModal}
            amount={paymentAmount}
            selectedNFT={selectedNFT}
          />
        </Elements>
      </div>

      <div className='mt-6'>
        <p className='text-sm text-gray-600'>Secure payment processing by Stripe</p>
      </div>
    </div>
  );
}
