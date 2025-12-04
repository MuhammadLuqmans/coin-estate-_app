import prisma from '@/libs/prisma';
import { transferTokens } from '@/utils/tokens-T';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
const ENCRYPTION_KEY = crypto.createHash('sha256').update(process.env.FORGOT_PASSWORD_KEY).digest(); // Derive 32-byte key

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

  // Validate the Bearer token
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

    const { id } = req.body; // Extract `id` from request body
    if (!id) {
      return res.status(400).json({ error: 'Payment ID is required.' });
    }

    // Find the payment record
    const payment = await prisma.payment.findUnique({
      where: { id },
      // select: { id: true, userId: true, status: true },
    });

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      // select: { id: true, userId: true, status: true },
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found.' });
    }

    if (payment.userId !== decoded.userId) {
      return res.status(403).json({ error: 'Unauthorized. You do not own this payment.' });
    }

    if (payment.status === 'COMPLETE') {
      return res.status(400).json({ error: 'Payment is already complete.' });
    }

    // get user data to check KYC verification

    let kycVerification = null;
    if (!user?.kycVerified) {
      kycVerification = { status: false, kyc: user?.kycVerified, message: 'KYC verification is required.' };
    } else {
      const tokenMintList = await prisma.minted.findMany();
      const tokenMint = tokenMintList?.find((token) => token?.tokenId === id);

      const userAddress = decrypt(user?.destinationValues);
      const tokenAddress = tokenMint?.tokenAddress;
      const receipt = await transferTokens(userAddress, tokenAddress, payment?.numberOfTokens);
      console.log('🚀 ~ handler ~ receipt:', receipt);
      if (receipt?.error) {
        return res.status(400).json({ error: receipt?.error });
      } else {
        kycVerification = { status: true, kyc: user?.kycVerified, message: 'KYC verified.' };
        await prisma.transaction.create({
          data: {
            userId: decoded.userId,
            sender: process.env.WALLET_ADDRESS,
            recipient: userAddress,
            amount: `${payment?.numberOfTokens}`,
            tokenPrice: payment?.tokenPrice,
            transactionHash: receipt.transactionHash,
            status: 'SUCCESS',
          },
        });
      }
    }
    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: id },
      data: {
        status: 'SECCESS',
      },
    });

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        userTokens: [...user?.userTokens, payment?.propertyId],
      },
    });

    // Respond with success
    res.status(200).json({
      message: 'Transaction Complete updated successfully.',
      payment: updatedPayment,
      user: updatedUser,
      kycVerification: kycVerification,
    });
  } catch (error) {
    console.error('Error updating payment status:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Unauthorized. Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Unauthorized. Token has expired.' });
    }

    res.status(500).json({
      error: 'Failed to update payment status. Please try again later.',
    });
  }
}
