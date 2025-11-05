/* eslint-disable react/no-unescaped-entities */
import { useQueryGetActiveResults, useQueryGetUser } from '@/hooks/query';
import React from 'react';

const placeholderValues = {
  PROJECT_NAME: 'GreenVille Project',
  TOKEN_AMOUNT: '500',
  TOKEN_VALUE: '$25,000',
  CONTRACT_DATE: 'March 27, 2025',
  JURISDICTION_CITY: 'Bogotá',
};

const rawContract = {
  agreement_purpose:
    "This agreement governs the investment by The Participant in the project {PROJECT_NAME}. The Participant contributes {TOKEN_AMOUNT} tokens, representing a proportional share of the project's economic results.",
  contribution_payment:
    'The Participant commits to acquiring {TOKEN_AMOUNT} tokens, valued at {TOKEN_VALUE} on {CONTRACT_DATE}.',
  contribution_payment1: 'Payment will be made via the methods provided on the CoinEstate platform.',
  management_administration: 'The Manager will diligently administer {PROJECT_NAME} and provide periodic reports.',
  management_administration1: 'The Participant has the right to access relevant information about the project.',
  profit_distribution: 'Profits will be distributed proportionally according to the number of tokens held.',
  profit_distribution1: 'The Manager retains the remaining portion, subject to applicable fees.',
  duration_termination:
    'This agreement is valid from the date of acceptance until project liquidation or mutual termination.',
  duration_termination1: 'Early termination will result in settlement and distribution of the corresponding amounts.',
  responsibility_risks: 'The Participant acknowledges the inherent risks of the investment.',
  responsibility_risks1: 'The Manager does not guarantee any specific returns but will act with due diligence.',
  data_protection: 'Both parties agree to keep all exchanged information confidential.',
  data_protection1: 'Data handling will comply with applicable data protection laws in Colombia.',
  governing_law: 'This agreement is governed by Colombian law.',
  governing_law1: 'Disputes will be resolved in the jurisdiction of {JURISDICTION_CITY}.',
  acceptance_signature:
    'By clicking "Accept" and marking the checkbox(es), The Participant agrees to the terms of this contract',
  acceptance_signature1: 'The system will log the acceptance, generating the final PDF document.',
};

export default function SignContract({ document, selectedNFT, handleNext }) {
  const { data: userData } = useQueryGetUser();
  const { data: userData2 } = useQueryGetActiveResults();
  console.log("🚀 ~ SignContract ~ userData:", userData2)

  const replacePlaceholders = (text, values) => {
    return text.replace(/{(.*?)}/g, (_, key) => values[key] || `{${key}}`);
  };

  const parsedContract = Object.fromEntries(
    Object.entries(rawContract).map(([key, value]) => [key, replacePlaceholders(value, placeholderValues)]),
  );

  const handleSignContract = () => {
    console.log('Sign Contract');
    handleNext();
  };

  return (
    <div className='min-h-screen bg-black-800 p-10 mb-10 rounded-xl'>
      <div className='max-w-4xl mx-auto  rounded-2xl '>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-Yellow-100 mb-2'>Investment Contract</h1>
          <p className='text-gray-400'>Please review the contract terms carefully before signing</p>
        </div>

        {/* Contract Header Section */}
        <div className='bg-black-600 rounded-xl p-8 mb-8'>
          <div className='max-w-3xl mx-auto'>
            {/* Company Details */}
            <div className='mb-6 pb-4 border-b border-gray-700'>
              <h3 className='text-Yellow-100 text-xl font-semibold mb-2'>Contract Parties</h3>
              <div className='flex items-center gap-2'>
                <span className='text-Yellow-100 font-medium'>Manager:</span>
                <span className='text-gray-400'>CoinEstate S.A.S.</span>
              </div>
            </div>

            {/* Participant Details */}
            <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
              <h3 className='text-Yellow-100 font-semibold col-span-2 mb-2'>
                The Participant ("The Investor")
              </h3>
              
              {/* Project Details */}
              <div className='flex flex-col'>
                <span className='text-Yellow-100 text-sm mb-1'>Project Name</span>
                <span className='text-gray-400 font-medium'>{selectedNFT?.name || 'N/A'}</span>
              </div>

              {/* User Details */}
              <div className='flex flex-col'>
                <span className='text-Yellow-100 text-sm mb-1'>User Name</span>
                <span className='text-gray-400 font-medium'>{userData?.username || 'N/A'}</span>
              </div>

              {/* ID Details */}
              <div className='flex flex-col'>
                <span className='text-Yellow-100 text-sm mb-1'>ID (C.C. or C.E.)</span>
                <span className='text-gray-400 font-medium'>{userData2?.id || 'N/A'}</span>
              </div>

              {/* Email Details */}
              <div className='flex flex-col'>
                <span className='text-Yellow-100 text-sm mb-1'>Email</span>
                <span className='text-gray-400 font-medium'>{userData?.email || 'N/A'}</span>
              </div>

              {/* Address Details - Full Width */}
              <div className='flex flex-col col-span-2'>
                <span className='text-Yellow-100 text-sm mb-1'>Address</span>
                <span className='text-gray-400 font-medium'>{userData?.address || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contract Content */}
        <div className='bg-black-600 rounded-xl p-6 mb-8'>
          <div className='space-y-6'>
            {Object.entries(parsedContract).map(([key, value]) => (
              <div key={key} className='contract-section'>
                <h3 className='text-Yellow-100 text-lg font-semibold mb-2'>
                  {key
                    .split('_')
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ')}
                </h3>
                <p className='text-gray-300 text-justify leading-relaxed'>{value}</p>
                <div className='border-b border-gray-700 mt-4'></div>
              </div>
            ))}
          </div>
        </div>
        {/* Signature Section */}
        <div className='bg-black-600 rounded-xl p-6'>
          <div className='text-center'>
            <h3 className='text-xl font-semibold text-Yellow-100 mb-4'>Contract Acceptance</h3>
            <div className='flex items-center justify-center gap-4 mb-6'>
              <input
                type='checkbox'
                id='accept-terms'
                className='w-5 h-5 rounded border-gray-600 bg-black-700 text-Yellow-100 focus:ring-Yellow-100'
              />
              <label htmlFor='accept-terms' className='text-gray-300'>
                I have read and agree to the terms of this contract
              </label>
            </div>
            <button onClick={() => handleSignContract()} className='bg-Yellow-100 text-black-800 px-8 py-3 rounded-lg font-bold hover:bg-Yellow-200 transition-colors duration-200'>
              Sign Contract
            </button>
          </div>
        </div>

        {/* Contract Details */}
        <div className='mt-8 text-center text-gray-400 text-sm'>
          <p>Contract Reference: {document?.id || 'XXXX-XXXX-XXXX'  }</p>
          <p>Generated on: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
