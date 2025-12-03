import KYCVerification from '@/components/Dashboard/KYCVerification';
import MakePayment from '@/components/Dashboard/MakePayment';
import SignContract from '@/components/Dashboard/SignContract';
import SummeryCard from '@/components/Dashboard/SummeryCard';
import { useMutateTransferFunds } from '@/hooks/mutation';
import { useQueryGetDocument, useQueryGetProperty, useQueryGetActiveResults } from '@/hooks/query';
import Layout from '@/layout/Vault-Dashboard';
import { usePropertyStates } from '@/store/useProduct';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

const tabs = {
  checkout: 'sign-contract',
  'sign-contract': 'make-payment',
  'make-payment': 'kyc-verification',
};

export default function Page() {
  const router = useRouter();
  const { data: getPropertyList } = useQueryGetProperty();
  const { data: activeUser } = useQueryGetActiveResults();
  const { mutate: sendTokens, isPending: isTransferringTokens } = useMutateTransferFunds();
  const initailPropert = usePropertyStates((state) => state.initailPropert);
  const [tokenTransferRequested, setTokenTransferRequested] = useState(false);

  const searchParams = useSearchParams();
  const paramsId = searchParams.get('id');
  const amount = searchParams.get('amount');
  const tokenAddress = searchParams.get('tokenAddress');
  const tab = searchParams.get('tab') || 'checkout';

  const selectedNFT = useMemo(
    () => getPropertyList?.find((item) => item.id === paramsId),
    [getPropertyList, paramsId],
  );
  const { data: document } = useQueryGetDocument(paramsId);
  const isKycVerified = !!activeUser?.kycVerified;
  const paymentId = initailPropert?.values;

  const getRouteForTab = useCallback(
    (targetTab) =>
      `/dashboard/market-place/processing/pay-by-card?tab=${targetTab}&id=${paramsId}&amount=${amount}&tokenAddress=${tokenAddress}`,
    [amount, paramsId, tokenAddress],
  );

  const handleNext = useCallback(() => {
    const nextTab = tabs?.[tab];
    if (!nextTab) return;
    router.push(getRouteForTab(nextTab));
  }, [getRouteForTab, router, tab]);

  const navigateToKyc = useCallback(() => {
    router.push(getRouteForTab('kyc-verification'));
  }, [getRouteForTab, router]);

  const sendPurchasedTokens = useCallback(() => {
    if (tokenTransferRequested || isTransferringTokens) {
      return;
    }

    if (!tokenAddress || !paymentId) {
      toast.error('Missing payment reference. Please refresh the page and try again.');
      return;
    }

    setTokenTransferRequested(true);
    // sendTokens(
    //   { address: tokenAddress, amount: paymentId },
    //   {
    //     onSuccess: () => {
    //       if (paramsId) {
    //         router.push(`/dashboard/market-place/${paramsId}`);
    //       } else {
    //         router.push('/dashboard/market-place');
    //       }
    //     },
    //     onError: () => {
    //       setTokenTransferRequested(false);
    //     },
    //   },
    // );
  }, [isTransferringTokens, paramsId, paymentId, router, sendTokens, tokenAddress, tokenTransferRequested]);

  const handlePaymentSuccess = useCallback(() => {
    if (isKycVerified) {
      sendPurchasedTokens();
      return;
    }
    navigateToKyc();
  }, [isKycVerified, navigateToKyc, sendPurchasedTokens]);

  useEffect(() => {
    if (tab === 'kyc-verification' && isKycVerified && paymentId && !tokenTransferRequested) {
      sendPurchasedTokens();
    }
  }, [isKycVerified, paymentId, sendPurchasedTokens, tab, tokenTransferRequested]);

  return (
    <Layout>
      <div className='px-6 xl:pr-10'>
        {tab === 'checkout' && <SummeryCard selectedNFT={selectedNFT} amount={amount} handleNext={handleNext} />}
        {tab === 'sign-contract' && (
          <SignContract selectedNFT={selectedNFT} amount={amount} handleNext={handleNext} document={document} />
        )}
        {tab === 'make-payment' && (
          <MakePayment selectedNFT={selectedNFT} amount={amount} handleNext={handleNext} onPaymentSuccess={handlePaymentSuccess} />
        )}
        {tab === 'kyc-verification' && (
          <div className='glass p-4 rounded-lg'>
            <KYCVerification onKycSuccess={sendPurchasedTokens} />
          </div>
        )}
      </div>
    </Layout>
  );
}
