import { CHAIN_ID, FactoryAbi, factoryAddress, tokenAbi, tokenAddress } from '@/contract';
import { useGlobalAmount } from '@/store/useGlobalStates';
import { ethers } from 'ethers';
import { useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useEthersSigner } from './ethers';

const useWalletConnector = () => {
  const { address: account, chainId } = useAccount();
  const signer = useEthersSigner(CHAIN_ID)
  const setContactDetails = useGlobalAmount((state) => state.setContactDetails);
  // eip155:97
  // const provider = useProvider();

  const onConnect = useCallback(async () => {
    try {
      const isChainId = chainId === CHAIN_ID;

      if (account && isChainId) {
        const TOKEN_CONTRACT = new ethers.Contract(tokenAddress, tokenAbi, signer);
        const FACTORY_CONTRACT = new ethers.Contract(factoryAddress, FactoryAbi, signer);
        console.log({FACTORY_CONTRACT})
        setContactDetails({
          FACTORY_CONTRACT,
          TOKEN_CONTRACT,
          address: account,
          chainId,
        });
      } else {
        if (account) {
          // notify('Change Network Mumbai Testnet 80001');
        }
        console.log('network is not connected');
      }
    } catch (error) {
      console.log(error);
    }
  }, [account, setContactDetails, signer]);

  return {
    onConnect,
  };
};

export default useWalletConnector;
