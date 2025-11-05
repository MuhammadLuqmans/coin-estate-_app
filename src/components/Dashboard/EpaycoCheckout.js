'use client';

import { useEffect, useState, useRef } from 'react';

export default function EpaycoCheckout({ productData }) {
  const [isClientReady, setIsClientReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const checkIntervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Check if script already exists to avoid duplicates
    const existingScript = document.querySelector('script[src="https://checkout.epayco.co/checkout.js"]');
    
    if (existingScript) {
      // Script already exists, check if ePayco is available
      if (window.ePayco && window.ePayco.checkout) {
        setIsClientReady(true);
        return;
      }
      
      // Wait for ePayco to be available
      checkIntervalRef.current = setInterval(() => {
        if (window.ePayco && window.ePayco.checkout) {
          setIsClientReady(true);
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
          }
        }
      }, 100);
      
      timeoutRef.current = setTimeout(() => {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }
        // Check if still not ready after timeout
        if (!window.ePayco || !window.ePayco.checkout) {
          setError('Failed to load ePayco SDK. Please refresh the page.');
        }
      }, 10000);
      
      return () => {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }

    // Add the ePayco script to the document
    const script = document.createElement('script');
    script.src = 'https://checkout.epayco.co/checkout.js';
    script.async = true;
    script.onerror = () => {
      setError('Failed to load ePayco checkout script. Please check your internet connection.');
    };
    
    script.onload = () => {
      // Script is loaded, but we need to make sure the ePayco object is initialized
      checkIntervalRef.current = setInterval(() => {
        if (window.ePayco && window.ePayco.checkout) {
          setIsClientReady(true);
          console.log('ePayco loaded successfully');
          if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
          }
        }
      }, 100);
      
      // Clear interval after 10 seconds to prevent infinite checking
      timeoutRef.current = setTimeout(() => {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }
        // Check if still not ready after timeout
        if (!window.ePayco || !window.ePayco.checkout) {
          setError('ePayco SDK loaded but not initialized. Please try refreshing the page.');
        }
      }, 10000);
    };
    
    document.body.appendChild(script);
    
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []); // Empty dependency array - only run once on mount

  const handleCheckout = () => {
    if (!isClientReady) {
      setError('ePayco SDK not loaded yet. Please wait.');
      return;
    }

    if (!window.ePayco || !window.ePayco.checkout) {
      setError('ePayco checkout not available. Please refresh the page.');
      return;
    }

    setLoading(true);
    setError(null);

    // Get API key from environment variable or use default test key
    const apiKey = process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY || "cb8d42f8571e473134792daec1b738dc6997805f";
    const isTestMode = process.env.NEXT_PUBLIC_EPAYCO_TEST_MODE !== 'false';

    // Default product data - can be overridden by props
    const data = {
      // Required payment parameters
      name: productData?.name || "Vestido Mujer Primavera",
      description: productData?.description || "Vestido Mujer Primavera",
      invoice: productData?.invoice || `INV-${Date.now()}`,
      currency: productData?.currency || "cop",
      amount: productData?.amount || "12000",
      tax_base: productData?.tax_base || "0",
      tax: productData?.tax || "0",
      country: productData?.country || "co",
      lang: productData?.lang || "es",

      // Onpage="false" - Standard="true"
      external: "false",

      // Optional attributes
      extra1: productData?.extra1 || "",
      extra2: productData?.extra2 || "",
      extra3: productData?.extra3 || "",
      
      // Callback URLs - use proper API routes
      confirmation: productData?.confirmation || `${window.location.origin}/api/epayco/confirmation`,
      response: productData?.response || `${window.location.origin}/dashboard/market-place/processing/payment-response`,

      // Customer attributes
      name_billing: productData?.name_billing || "Andres Perez",
      address_billing: productData?.address_billing || "Carrera 19 numero 14 91",
      type_doc_billing: productData?.type_doc_billing || "cc",
      mobilephone_billing: productData?.mobilephone_billing || "3050000000",
      number_doc_billing: productData?.number_doc_billing || "100000000"
    };

    try {
      console.log('Configuring ePayco checkout with data:', data);
      const handler = window.ePayco.checkout.configure({
        key: apiKey,
        test: isTestMode
      });

      console.log('Opening ePayco checkout...');
      handler.open(data);
      setLoading(false);
    } catch (error) {
      console.error('Error opening ePayco checkout:', error);
      setError(`Error opening checkout: ${error.message || 'Unknown error'}`);
      setLoading(false);
    }
  };

  return (
    <div className="epayco-checkout">
      <button 
        onClick={handleCheckout}
        disabled={!isClientReady || loading}
        className={`${
          !isClientReady || loading
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-500 hover:bg-blue-700'
        } text-white font-bold py-2 px-4 rounded transition-colors`}
      >
        {loading ? 'Opening checkout...' : isClientReady ? 'Pay with ePayco' : 'Loading ePayco...'}
      </button>
      
      {error && (
        <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      
      {!isClientReady && !error && (
        <p className="text-xs text-gray-500 mt-2">
          Loading ePayco checkout...
        </p>
      )}
    </div>
  );
} 