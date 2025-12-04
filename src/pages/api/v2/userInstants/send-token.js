const { tokenAbi, tokenAddress: defaultTokenAddress } = require('@/contract');
const { ethers } = require('ethers');

import prisma from '@/libs/prisma';
import { transferTokens } from '@/utils/tokens-T';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// async function transferTokens(recipient, CONTRACT_ADDRESS, amount) {
//   try {
//     const RPC_URL = 'https://bnb-testnet.g.alchemy.com/v2/gjOpWVwh7CDyPa2g52cxcCeudpPuoAoG';
//     const PRIVATE_KEY = process.env.PRIVATE_KEY;
//     const WALLET_ADDRESS = process.env.WALLET_ADDRESS;

//     if (!PRIVATE_KEY) {
//       throw new Error('Missing PRIVATE_KEY environment variable');
//     }
//     if (!WALLET_ADDRESS) {
//       throw new Error('Missing WALLET_ADDRESS environment variable');
//     }

//     // Use default token address if CONTRACT_ADDRESS is invalid
//     let contractAddr = CONTRACT_ADDRESS;
//     if (!contractAddr || !ethers.utils.isAddress(contractAddr)) {
//       console.log(`Invalid CONTRACT_ADDRESS provided: "${contractAddr}", using default: ${defaultTokenAddress}`);
//       contractAddr = defaultTokenAddress;
//     }

//     if (!ethers.utils.isAddress(recipient)) {
//       throw new Error('Recipient is not a valid Ethereum address');
//     }

//     if (!ethers.utils.isAddress(WALLET_ADDRESS)) {
//       throw new Error('WALLET_ADDRESS is not a valid Ethereum address');
//     }

//     // Set up the provider with explicit network config to avoid ENS lookups
//     const network = {
//       chainId: 97,
//       name: 'bnbt',
//     };
//     const provider = new ethers.providers.JsonRpcProvider(RPC_URL, network);

//     // Create a wallet instance
//     const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

//     // Connect to the contract
//     const contract = new ethers.Contract(contractAddr, tokenAbi, wallet);
//     console.log('🚀 ~ transferTokens ~ using contract address:', contractAddr);

//     // Convert amount to the correct format
//     const formattedAmount = ethers.utils.parseEther(`${amount}`);

//     // Call the `adminTransfer` function
//     const tx = await contract.adminTransfer(WALLET_ADDRESS, recipient, formattedAmount);
//     console.log('🚀 ~ transferTokens ~ tx:', tx.hash);

//     // Wait for transaction to be mined
//     const receipt = await tx.wait();

//     console.log('Transfer successful:', receipt.transactionHash);
//     return {
//       success: true,
//       transactionHash: receipt.transactionHash,
//     };
//   } catch (error) {
//     console.error('Error during transfer:', error);
//     return {
//       success: false,
//       error: error.message,
//     };
//   }
// }

const ENCRYPTION_KEY = crypto.createHash('sha256').update(process.env.FORGOT_PASSWORD_KEY).digest(); // Derive 32-byte key

function decrypt(text) {
  const [iv, encrypted] = text.split(':');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(Buffer.from(encrypted, 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. Missing or invalid token.' });
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded || !decoded.userId) {
        return res.status(401).json({ error: 'Unauthorized. Invalid token.' });
      }
      const { amount: paymentId, tokenAddress } = req.body;
      
      if (!paymentId) {
        return res.status(400).json({ error: 'Payment ID is required.' });
      }

      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const paymentInfo = await prisma.payment.findUnique({ where: { id: paymentId } });
      if (!paymentInfo) {
        return res.status(404).json({ error: 'Payment not found.' });
      }

      const amount = paymentInfo?.numberOfTokens;
      const userAddress = decrypt(user.destinationValues);
      
      console.log('Transfer request:', { paymentId, tokenAddress, amount, userAddress: userAddress?.substring(0, 10) + '...' });

      // Validate the amount is positive
      if (isNaN(amount) || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: 'Invalid amount. Must be a positive number.' });
      }

      const receipt = await transferTokens(userAddress, tokenAddress, amount);

      if (receipt?.error) {
        return res.status(400).json({ error: receipt?.error });
      }

      // Store the transaction in the database
      await prisma.transaction.create({
        data: {
          userId: decoded.userId,
          sender: process.env.WALLET_ADDRESS,
          recipient: userAddress,
          amount: `${amount}`,
          tokenPrice: paymentInfo?.tokenPrice,
          transactionHash: receipt.transactionHash,
          status: 'SUCCESS',
        },
      });

      res.status(201).json({
        message: 'Funds transferred successfully.',
        transactionHash: receipt.transactionHash,
      });
    } catch (error) {
      console.error('Error transferring funds:', error);

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Unauthorized. Invalid token.' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Unauthorized. Token has expired.' });
      }

      res.status(500).json({ error: 'Failed to transfer funds. Please try again later.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }
}
