import prisma from '@/libs/prisma';
import jwt from 'jsonwebtoken';

const calculateTotal = (array, field) => {
  return array.reduce((total, item) => total + (item[field] || 0), 0);
};
function getPropertyPayments(propertyId, payments) {
  const paymentList = payments.filter((payment) => payment.propertyId === propertyId);
  return {
    // properties,
    propertyId,
    remaining: calculateTotal(paymentList, 'amount'),
  };
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
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

      // Fetch blogs and items
      const user = await prisma.User.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          createdAt: true,
          userTokens: true,
          kycVerified: true,
          kycVerifiedAt: true,
        },
      });
      const properties = await prisma.property.findMany();
      const userRecords = await prisma.userRecords.findMany({ where: { userId: decoded.userId } });

      const completePaymentList = await prisma.payment.findMany({
        where: { status: 'SECCESS' },
      });
      // userId: decoded.userId,
      const userTransactions = await prisma.payment.findMany({ where: { userId: decoded.userId } });
      const payments = await prisma.payment.findMany({ where: { userId: decoded.userId, status: 'SECCESS' } });
      const transactions = await prisma.transaction.findMany({ where: { userId: decoded.userId } });

      const totalInvest = calculateTotal(payments, 'amount');
      const totalTokens = calculateTotal(payments, 'numberOfTokens');

      const propertyList = [];
      // const transactionList =
      properties?.map((property) => {
        if (user?.userTokens?.includes(property?.id)) {
          propertyList.push(property);
        }
      });

      // it generate sale list mean how many tokens are sold from each property
      const sellList = properties?.map((property) => getPropertyPayments(property.id, completePaymentList));
      let totalEarningFromAllProperties = 0;

      const calculate = JSON.parse(userRecords?.[0]?.properties) || {};
      let earnings = calculate ? Object.values(calculate) : [];
      earnings = earnings.map((item) => item && (totalEarningFromAllProperties += item?.earning));

      const userData = {
        ...user,
        totalInvest,
        totalTokens,
        invest: { transactions, payments: userTransactions },
        userProperties: propertyList,
        values: sellList,
        userRecords: calculate,
        totalEarningFromAllProperties,
      };

      // Map blogs to their respective items

      res.status(200).json({ message: 'fetched successfully', data: userData });
    } catch (error) {
      console.error('Error fetching blogs:', error);

      // Handle specific JWT errors
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Unauthorized. Invalid token.' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Unauthorized. Token has expired.' });
      }

      res.status(500).json({ error: 'Failed to fetch blogs. Please try again later.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }
}
