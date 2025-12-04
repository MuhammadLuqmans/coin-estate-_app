import prisma from '@/libs/prisma';
import { transferTokens } from '@/utils/tokens-T';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ENCRYPTION_KEY = crypto.createHash('sha256').update(process.env.FORGOT_PASSWORD_KEY).digest();

function decrypt(text) {
  const [iv, encrypted] = text.split(':');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(Buffer.from(encrypted, 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Missing or invalid token.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Unauthorized. Invalid token.' });
    }

    const payload = req.body || {};

    // Find user's pending payment
    const payment = await prisma.payment.findFirst({
      where: {
        userId: decoded.userId,
        status: 'SECCESS',
      },
    });

    if (!payment) {
      return res.status(404).json({ error: 'No pending payment found for this user.' });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (!user.destinationValues) {
      return res.status(400).json({ error: 'User wallet address not found.' });
    }

    // Get token mint details
    const tokenMintList = await prisma.minted.findMany();
    const tokenMint = tokenMintList?.find((token) => token?.tokenId === payment.propertyId);

    if (!tokenMint) {
      return res.status(404).json({ error: 'Token mint not found for this payment.' });
    }

    // Transfer tokens to user
    const userAddress = decrypt(user.destinationValues);
    const tokenAddress = tokenMint.tokenAddress;
    const receipt = await transferTokens(userAddress, tokenAddress, payment.numberOfTokens);
    console.log('🚀 ~ KYC complete ~ receipt:', receipt);

    if (receipt?.error) {
      return res.status(400).json({ error: receipt.error });
    }

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: decoded.userId,
        sender: process.env.WALLET_ADDRESS,
        recipient: userAddress,
        amount: `${payment.numberOfTokens}`,
        tokenPrice: payment.tokenPrice,
        transactionHash: receipt.transactionHash,
        status: 'SUCCESS',
        reference: payload?.reference || null,
      },
    });

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETE',
      },
    });

    // Update user KYC status and add token to user
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        kycVerified: true,
        kycVerifiedAt: new Date(),
        userTokens: [...(user.userTokens || []), payment.propertyId],
      },
      select: {
        id: true,
        email: true,
        kycVerified: true,
        kycVerifiedAt: true,
        userTokens: true,
      },
    });

    return res.status(200).json({
      message: 'KYC completed and tokens transferred successfully.',
      data: updatedUser,
      meta: {
        reference: payload?.reference || null,
        transactionHash: receipt.transactionHash,
        tokensTransferred: payment.numberOfTokens,
      },
    });
  } catch (error) {
    console.error('Error updating KYC status:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized. Invalid token.' });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized. Token has expired.' });
    }

    return res.status(500).json({ error: 'Failed to update KYC status. Please try again later.' });
  }
}
