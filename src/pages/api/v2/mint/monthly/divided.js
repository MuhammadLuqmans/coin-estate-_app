import prisma from '@/libs/prisma';
import jwt from 'jsonwebtoken';
const distributeFunds = (monthlyValues, tokenHolders, startDate, endDate) => {
  // Convert date strings to Date objects for comparison
  const start = new Date(startDate);
  const end = new Date(endDate);

  const groupedHolders = tokenHolders.reduce((acc, transaction) => {
    if (!acc[transaction.propertyId]) {
      acc[transaction.propertyId] = {};
    }
    if (!acc[transaction.propertyId][transaction.userId]) {
      acc[transaction.propertyId][transaction.userId] = 0;
    }
    acc[transaction.propertyId][transaction.userId] += transaction.amount;
    return acc;
  }, {});

  // Step 2: Calculate the distribution
  const distribution = monthlyValues.reduce((acc, monthlyToken) => {
    const { tokenId, percentage, price, totalPrice, createdAt } = monthlyToken;
    console.log("🚀 ~ distribution ~ createdAt:", monthlyValues,tokenHolders)

    // If no holders for this tokenId, skip
    if (!groupedHolders[tokenId]) {
      acc[tokenId] = {};
      return acc;
    }

    let distributableAmount = price / totalPrice;

    // Calculate the distributable amount by percentage
    // let distributableAmount = (percentage / 100) * price;
    //  distributableAmount = distributableAmount / totalPrice

    // Get total tokens held for this tokenId
    const totalTokens = Object.values(groupedHolders[tokenId]).reduce((sum, value) => sum + value, 0);
    console.log('🚀 ~ distribution ~ totalTokens:', totalTokens, totalPrice);

    // Calculate each holder's share
    acc[tokenId] = {};
    for (const userId in groupedHolders[tokenId]) {
      acc[tokenId][userId] = totalTokens * distributableAmount;

      // acc[tokenId][userId] = totalTokens * distributableAmount;
    }

    return acc;
  }, {});

  return distribution;
};

// // Example data
// const monthlyValues = [
//   { tokenId: 'T1', percentage: 50, price: 1000, totalPrice: 2000, createdAt: "2025-03-01" },
//   { tokenId: 'T2', percentage: 50, price: 1000, totalPrice: 2000, createdAt: "2025-03-05" },
//   { tokenId: 'T1', percentage: 30, price: 600, totalPrice: 2000, createdAt: "2025-02-25" } // This will be excluded if filtered for March
// ];

// const tokenHolders = [
//   { propertyId: 'T1', userId: 'U1', amount: 10 },
//   { propertyId: 'T1', userId: 'U2', amount: 30 },
//   { propertyId: 'T2', userId: 'U1', amount: 50 },
//   { propertyId: 'T2', userId: 'U3', amount: 50 }
// ];

// Example usage: filter for transactions in March 2025
// console.log();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Validate the Bearer token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({ error: 'Unauthorized. Missing or invalid token.' });
    }

    const token = authHeader.split(' ')[1];

    try {
      // Verify the JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded || !decoded.userId) {
        return res.status(401).json({ error: 'Unauthorized. Invalid token.' });
      }

      const data = req.body;

      const monthlyValues = await prisma.monthlyProcess.findMany();
      const tokenHolders = await prisma.payment.findMany({
        where: {
          // userId: decoded.userId,
          status: 'SECCESS',
        },
      });

      const groupedTransactions = monthlyValues.reduce((acc, item) => {
        acc[item.tokenId] = tokenHolders.filter((transaction) => transaction.propertyId === item.tokenId);
        return acc;
      }, {});

      const groupedTransactionsAmount = monthlyValues.reduce((acc, item) => {
        const transactions = tokenHolders.filter((transaction) => transaction.propertyId === item.tokenId);

        acc[item.tokenId] = transactions.reduce((userAcc, transaction) => {
          const { userId, amount } = transaction;
          userAcc[userId] = (userAcc[userId] || 0) + amount; // Sum amounts for the same userId
          return userAcc;
        }, {});

        return acc;
      }, {});

      // Example Usage
      // const result = distributeFunds(monthlyValues, tokenHolders);
      const result = distributeFunds(monthlyValues, tokenHolders, '2025-03-01', '2025-03-31');
      console.log({result})

      const userId = decoded.userId; // User we are calculating for

      // Step 1: Calculate user earnings per token
      let totalEarnings = 0;
      const userEarnings = {};
      let totalTokenBalance = 0;

      monthlyValues.forEach(({ tokenId, price, totalPrice }) => {
        if (result[tokenId] && result[tokenId][userId]) {
          const userShare = result[tokenId][userId]; // User's % share of token
          const purchased = groupedTransactionsAmount[tokenId][userId];
          // const earnings = price * userShare; // Calculate earnings for this token
          const earnings = userShare; // Calculate earnings for this token
          userEarnings[tokenId] = { earned: earnings, monthly: price, purchased, totalPrice };
          totalEarnings += earnings;
          totalTokenBalance += purchased;
        }
      });

      // console.log({ monthlyValues, tokenHolders, LIST:JSON.stringify(groupedTransactions) });

      res.status(200).json({
        message: 'get monthly recodes',
        data: {
          ...userEarnings,
          totalEarnings: totalEarnings?.toFixed(2),
          totalTokenBalance,
          groupedTransactionsAmount,
          groupedTransactions,
        },
      });
    } catch (error) {
      console.error('Error creating property:', error);

      // Handle specific JWT errors
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Unauthorized. Invalid token.' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Unauthorized. Token has expired.' });
      }

      res.status(500).json({ error: 'Failed to create property. Please try again later.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }
}
