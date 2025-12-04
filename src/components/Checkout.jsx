import { useMutatePDUpdate } from '@/hooks/mutation';
import { usePropertyStates } from '@/store/useProduct';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useState } from 'react';

const CheckoutComponent = ({ id, amount, selectedNFT, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState();
  const [loading, setLoading] = useState(false);
  const initailPropert = usePropertyStates((state) => state.initailPropert);
  const clientSecret = initailPropert?.init;

  const { mutate: fixUriDetails } = useMutatePDUpdate({
    onCompleted: () => {
      setLoading(false);
      onPaymentSuccess?.();
    },
  });

  const handleSubmit = async (event) => {
    setLoading(true);

    if (!stripe || !elements) {
      return;
    }

    const { error: submitError } = await elements.submit();

    if (submitError) {
      setErrorMessage(submitError.message);
      setLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/market-place/${selectedNFT?.id || id}`,
      },
    });
    if (error) {
      // This point is only reached if there's an immediate error when
      // confirming the payment. Show the error to your customer (for example, payment details incomplete)
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    if (!initailPropert?.values) {
      setLoading(false);
      setErrorMessage('Missing payment reference. Please refresh the page and try again.');
      return;
    }

    // Payment successful - update backend and bubble up
    fixUriDetails(initailPropert?.values, {
      onError: () => {
        setLoading(false);
      },
      onSuccess: (res) => {
        console.log("🚀 ~ handleSubmit ~ onSuccess: res", res)
      },
    });
  };

  if (!clientSecret || !stripe || !elements) {
    return (
      <div className='flex items-center justify-center'>
        Loading...
        <div
          className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white'
          role='status'>
          <span className='!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]'>
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* <button onClick={() => fixUriDetails('678e17f74c1b7f03e4545b09')}>Complete</button> */}
      <div className='bg-white p-2 rounded-md'>
        {clientSecret && <PaymentElement />}

        {errorMessage && <div className='text-red-100 text-sm my-2'>{errorMessage}</div>}

        <button
          disabled={!stripe || loading}
          onClick={() => handleSubmit()}
          className='text-white w-full p-5 bg-blue-400 mt-2 rounded-md font-bold disabled:opacity-50 disabled:animate-pulse'>
          {!loading ? `Pay $${amount}` : 'Processing...'}
        </button>
      </div>
    </div>
  );
};

export default CheckoutComponent;
