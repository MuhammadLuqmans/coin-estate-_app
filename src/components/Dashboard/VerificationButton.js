import React, { useState } from 'react';

const VerificationButton = ({ 
  token, 
  label = 'Start Verification', 
  onComplete, 
  onError: onErrorCallback,
  onModalClose: onModalCloseCallback,
  onTokenExpired,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const startVerification = async () => {
    if (!token) {
      console.error('No token provided for ComplyCube verification');
      return;
    }

    setIsLoading(true);

    try {
      const complyCubeInstance = window.ComplyCube?.mount({
        token: token,
        containerId: 'complycube-mount',
        stages: [
          'intro',
          'documentCapture',
          {
            name: 'faceCapture',
            options: {
              mode: 'video'
            }
          },
          'completion'
        ],
        onComplete: function(data) {
          // Using the data attributes returned, request your
          // backend server to perform the necessary ComplyCube checks
          console.info('Capture complete', data);
          if (typeof onComplete === 'function') {
            onComplete(data);
          }
        },
        onModalClose: function() {
          // Handle the modal closure attempt
          console.log('Modal manually closed');
          if (complyCubeInstance) {
            complyCubeInstance.updateSettings({ isModalOpen: false });
          }
          if (typeof onModalCloseCallback === 'function') {
            onModalCloseCallback();
          }
        },
        onError: function({ type, message }) {
          if (type === 'token_expired') {
            // Request a new SDK token
            console.warn('ComplyCube token expired');
            if (typeof onTokenExpired === 'function') {
              onTokenExpired();
            }
          } else {
            // Handle other errors
            console.error('ComplyCube error:', message);
            if (typeof onErrorCallback === 'function') {
              onErrorCallback({ type, message });
            }
          }
        }
      });
    } catch (error) {
      console.error('Failed to mount ComplyCube SDK:', error);
      if (typeof onErrorCallback === 'function') {
        onErrorCallback({ type: 'mount_error', message: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div id='complycube-mount'></div>
      <button
        onClick={() => startVerification()}
        disabled={isLoading || !token}
        className='bg-yellow text-black px-4 py-2 rounded-md mt-4 w-full font-bold text-black-200 disabled:opacity-50'>
        {isLoading ? 'Loading...' : label}
      </button>
    </>
  );
};

export default VerificationButton;
