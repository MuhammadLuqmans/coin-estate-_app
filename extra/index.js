// Beacon
// https://testnet.bscscan.com/address/0x293c3a98f8C665B6660FE002Ba29Dc2CbD00Be14

// Factory
// https://testnet.bscscan.com/address/0x5D0C11f3fab94eb008E0C1012CF708456fdf9d57

// Test contract after hitting createErc884 function
// https://testnet.bscscan.com/address/0xC10a4e38AdD58228A16224910F9720a979cfBbdF


// abc gmail
// 0x46efA3Aa23d08c5e56f3668D961371A4730F860D
// luqmanaslam gmail
// 0xA90f979c91B5422ea8eA36ecd1128876fc371bc3




// From factory contract
// to create new property
// createERC884

// to get all property lists
// getAllERC884Contracts


// Token contract 
// then owner need to mint nft = mint
// to sponser address =  transfer

// owner >                
// mint  > sponser address > transfer > to pass nft to user or buyer address

// when user click on investing button we need to get payment form strip

// as we received payments we need to transfer nft to him



// ====================================== testing ===========================================


import prisma from '@/libs/prisma';
import jwt from 'jsonwebtoken';

const distributeFunds = (monthlyValues, tokenHolders) => {
  // Step 1: Group token holders by tokenId and sum their amounts
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
    const { tokenId, percentage, price } = monthlyToken;

    // If no holders for this tokenId, skip
    if (!groupedHolders[tokenId]) {
      acc[tokenId] = {};
      return acc;
    }

    // Calculate the distributable amount
    const distributableAmount = (percentage / 100) * price;

    // Get total tokens held for this tokenId
    const totalTokens = Object.values(groupedHolders[tokenId]).reduce((sum, value) => sum + value, 0);

    // Calculate each holder's share
    acc[tokenId] = {};
    for (const userId in groupedHolders[tokenId]) {
      acc[tokenId][userId] = (groupedHolders[tokenId][userId] / totalTokens) * distributableAmount;
    }

    return acc;
  }, {});

  return distribution;
};

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
      const tokenHolders = await prisma.payment.findMany();

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
      const result = distributeFunds(monthlyValues, tokenHolders);

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

      // Output results

      // console.log({ result });
      // console.log({ groupedTransactions, monthlyValues });

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



[
  { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
  {
    "inputs": [
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "string", "name": "_symbol", "type": "string" }
    ],
    "name": "createERC884",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "erc884Contracts",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllERC884Contracts",
    "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  }
]