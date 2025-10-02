import { create } from 'zustand';

export const useGlobalStore = create((set) => ({
  contract: {
    FACTORY_CONTRACT:null,
    TOKEN_CONTRACT:null,
    chainId: null,
    address: null,
  },
  amount: 2.5,
  setContactDetails: (abis) =>
    set({
      contract: abis,
    }),
  setAmount: (amount) =>
    set({
      amount: amount,
    }),
}));


// useMutationInitiatePayment