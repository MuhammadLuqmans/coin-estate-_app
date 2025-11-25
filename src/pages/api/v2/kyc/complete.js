import prisma from '@/libs/prisma';
import jwt from 'jsonwebtoken';

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

    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        kycVerified: true,
        kycVerifiedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        kycVerified: true,
        kycVerifiedAt: true,
      },
    });

    return res.status(200).json({
      message: 'KYC status updated successfully.',
      data: user,
      meta: {
        reference: payload?.reference || null,
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



