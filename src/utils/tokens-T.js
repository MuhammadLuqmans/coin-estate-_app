import { tokenAbi, tokenAddress } from '@/contract';
import { ethers } from 'ethers';

export async function transferTokens(recipient, CONTRACT_ADDRESS, amount) {
  try {
    const RPC_URL = 'https://bnb-testnet.g.alchemy.com/v2/gjOpWVwh7CDyPa2g52cxcCeudpPuoAoG';
    const PRIVATE_KEY = process.env.PRIVATE_KEY;
    const WALLET_ADDRESS = process.env.WALLET_ADDRESS;

    if (!PRIVATE_KEY) {
      throw new Error('Missing PRIVATE_KEY environment variable');
    }
    if (!WALLET_ADDRESS) {
      throw new Error('Missing WALLET_ADDRESS environment variable');
    }

    // Use default token address if CONTRACT_ADDRESS is invalid
    let contractAddr = CONTRACT_ADDRESS;
    if (!contractAddr || !ethers.utils.isAddress(contractAddr)) {
      console.log(`Invalid CONTRACT_ADDRESS provided: "${contractAddr}", using default: ${tokenAddress}`);
      contractAddr = tokenAddress;
    }

    if (!ethers.utils.isAddress(recipient)) {
      throw new Error('Recipient is not a valid Ethereum address');
    }

    if (!ethers.utils.isAddress(WALLET_ADDRESS)) {
      throw new Error('WALLET_ADDRESS is not a valid Ethereum address');
    }

    // Set up the provider with explicit network config to avoid ENS lookups
    const network = {
      chainId: 97,
      name: 'bnbt',
    };
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL, network);

    // Create a wallet instance
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    // Connect to the contract
    const contract = new ethers.Contract(contractAddr, tokenAbi, wallet);
    console.log('🚀 ~ transferTokens ~ using contract address:', contractAddr);

    // Convert amount to the correct format
    const formattedAmount = ethers.utils.parseEther(`${amount}`);

    // Call the `adminTransfer` function
    const tx = await contract.adminTransfer(WALLET_ADDRESS, recipient, formattedAmount);
    console.log('🚀 ~ transferTokens ~ tx:', tx.hash);

    // Wait for transaction to be mined
    const receipt = await tx.wait();

    console.log('Transfer successful:', receipt.transactionHash);
    return {
      success: true,
      transactionHash: receipt.transactionHash,
    };
  } catch (error) {
    console.error('Error during transfer:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}