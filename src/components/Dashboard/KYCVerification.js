/* eslint-disable react/no-unescaped-entities */
import { useState } from 'react';
import VerificationButton from './VerificationButton';
import { endPoint } from '@/hooks/queryContants';
import Input from '../Input';
import { useMutateCompleteKyc } from '@/hooks/mutation';

export const getConfig = (clientId, onFinishCaptureInformation) => ({
  branding: {
    // Customize the modal colors, fonts, or logo
    primaryColor: '#1565c0',
    buttonTextColor: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    logo: {
      lightLogoUrl: 'https://static.vecteezy.com/system/resources/thumbnails/000/609/739/small/3-19.jpg',
    },
  },

  stages: [
    {
      type: 'documentCapture',
      options: {
        documentTypes: {
          passport: true,
          driving_license: true,
          national_identity_div: true,
        },
      },
    },
    {
      type: 'faceCapture',
      options: {
        mode: 'photo',
      },
    },
    {
      type: 'faceCapture',
      options: {
        mode: 'video',
      },
    },
  ],
  onComplete: async (data) => {
    // data contains e.g. data.documentCapture.documentId, data.faceCapture.livePhotoId
    console.log('SDK capture complete:', data);
    onFinishCaptureInformation();
  },
});

// Mock check to see if results are cleared (simulating a final pass/fail status)
function checkVerificationStatus(clientId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock: always returns "clear"
      resolve({ status: 'clear' });
    }, 2000);
  });
}

const KYCVerification = ({ onKycSuccess }) => {
  // Steps: 'welcome' -> 'enterData' -> 'verificationPrompt' -> 'processing' -> 'result'
  const [step, setStep] = useState('welcome');

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tokenResponse, setTokenResponse] = useState(null);
  const [verificationOutcome, setVerificationOutcome] = useState(null);
  const { mutateAsync: markKycComplete } = useMutateCompleteKyc();

  // 1) Welcome screen -> form
  const handleBegin = () => {
    setStep('enterData');
  };

  // 2) Submit user details to get token
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${endPoint}/kyc/client-token`, {
        type: 'person',
        ...formData,
      });
      setTokenResponse(res.data); // { token, clientId }
      setStep('verificationPrompt');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // 3) Once the Web SDK finishes capturing data, it calls onComplete from config,
  //    which calls onFinishCaptureInformation -> we come here
  const handleVerificationComplete = async () => {
    if (!tokenResponse?.clientId) {
      setVerificationOutcome('fail');
      setStep('result');
      return;
    }

    // We can do a final check or show a spinner
    setStep('processing');

    try {
      const status = await checkVerificationStatus(tokenResponse.clientId);
      if (status.status !== 'clear') {
        setVerificationOutcome('fail');
        setStep('result');
        return;
      }

      await markKycComplete({ clientId: tokenResponse.clientId });
      if (typeof onKycSuccess === 'function') {
        await onKycSuccess();
      }
      setVerificationOutcome('success');
    } catch (error) {
      setVerificationOutcome('fail');
    }

    setStep('result');
  };

  // 4) Final result screen
  const renderResult = () => {
    if (verificationOutcome === 'success') {
      return (
        <div textAlign='center'>
          <p variant='h5' color='success.main'>
            You’re Verified!
          </p>
          <p>Welcome to CC Trading! You can now buy and sell stocks, bonds, and crypto securely.</p>
        </div>
      );
    }
    return (
      <div textAlign='center'>
        <p variant='h5' color='error'>
          Verification Failed
        </p>
        <p>We couldn’t confirm your identity. Please try again or contact support for help.</p>
      </div>
    );
  };

  // Render the flow
  return (
    <div sx={{ width: 600, mx: 'auto', mt: 5 }}>
      {step === 'welcome' && (
        <div sx={{ backgroundColor: '#eef7ee' }}>
          <div className='text-center'>
            <div className='mb-3 mx-auto'>
              <img
                src='https://static.vecteezy.com/system/resources/thumbnails/000/609/739/small/3-19.jpg'
                alt='CC Trading Logo'
                style={{ borderRadius: 8 }}
                className='mx-auto'
              />
            </div>
            <p variant='h4' fontWeight='bold'>
              CC Trading Onboarding
            </p>
            <p variant='body1' sx={{ mb: 3 }}>
              Securely verify your identity to start trading with us.
            </p>
            <button
              variant='contained'
              onClick={handleBegin}
              className='bg-yellow text-black px-4 py-2 rounded-md mt-4 w-full font-bold text-black-200'>
              {' '}
              Start Verification
            </button>
          </div>
        </div>
      )}

      {step === 'enterData' && (
        <div>
          <div>
            <p  className='text-32 font-bold text-center font-ubuntu'>
              Personal Information
            </p>
            <p className='text-center'>
              Please provide your details, and we'll verify you for a safe trading environment.
            </p>
            <form onSubmit={handleFormSubmit} className='mt-4 max-w-[600px] mx-auto mb-10'>
              <Input
                Label={'Email'}
                id='email'
                fullWidth
                margin='normal'
                required
                className={'mt-1'}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                Label={'First Name'}
                id='firstName'
                fullWidth
                margin='normal'
                required
                className={'mt-1'}
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
              <Input
                Label={'Last Name'}
                id='lastName'
                fullWidth
                className={'mt-1'}
                margin='normal'
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />

              {error && (
                <p className='text-red-100 mt-2'>
                  {error}
                </p>
              )}

              <button
                type='submit'
                variant='contained'
                disabled={loading}
                className='bg-yellow text-black px-4 py-2 rounded-md mt-4 w-full font-bold text-black-200'>
                {loading ? 'Loading...' : 'Continue'}
              </button>
            </form>
          </div>
        </div>
      )}

      {step === 'verificationPrompt' && tokenResponse && (
        <div sx={{ backgroundColor: '#eef7ee' }}>
          <div sx={{ textAlign: 'center' }}>
            <p className='text-32 font-bold text-center font-ubuntu'>
              Identity Verification
            </p>
            <p className='mb-5 text-center'>Please complete the required checks. We’ll confirm your status once the pop-up closes.</p>
            <VerificationButton
              token={tokenResponse.token}
              clientId={tokenResponse.clientId}
              // IMPORTANT: pass the dynamic config with your onComplete logic
              config={getConfig(tokenResponse.clientId, () => handleVerificationComplete())}
              label='Start verification'
            />
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div textAlign='center' sx={{ mt: 4 }}>
          {/* <CircularProgress /> */}
          <p sx={{ mt: 2 }}>Verifying your details...</p>
        </div>
      )}

      {step === 'result' && (
        <div>
          <div>
            {renderResult()}
            <div sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
              <p fontWeight='bold' fontSize={20}>
                Staggered Screening with Monitoring
              </p>
              <div variant='h6' fontWeight='bold'>
                Flow:
                <p>1 - Start with a Standard Screening Check to quickly identify major compliance issues.</p>
                <p>2- If the Standard Screening Check is Clear, upgrade to an Extensive Screening Check.</p>
                <p>
                  3- Enable Continuous Monitoring on the client if both checks are clear, ensuring any future compliance
                  risks are flagged.
                </p>
                <p sx={{ mt: 2, fontWeight: 'bold' }}>Why:</p>
                <p>This ensures we comply with financial regulations and provide a safe trading platform.</p>
                <p fontSize={12} marginTop={2}>
                  Checks flow is trigger in the BE once the onboarding is complete{' '}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCVerification;
