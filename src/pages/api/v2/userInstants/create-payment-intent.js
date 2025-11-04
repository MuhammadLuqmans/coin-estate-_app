import prisma from '@/libs/prisma';
import jwt from 'jsonwebtoken';
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// check total Sell
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

      // Extract the property ID from the request body
      const { id, amount: noTokens } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Property ID is required.' });
      }

      // Fetch property details using the ID
      const property = await prisma.property.findUnique({
        where: { id },
      });
      const paymentList = await prisma.payment.findMany({ where: { status: 'SECCESS' } });

      const remaining = getPropertyPayments(id, paymentList);

      // const totalTokens = property?.tokenPrice;
      let remainingTokens = property?.totalInvestmentPrice - remaining?.remaining;
      remainingTokens = remainingTokens / property?.tokenPrice;

      if (noTokens >= remainingTokens) {
        return res.status(400).json({ error: "We don't have enough tokens to sale" });
      }

      const amount = noTokens * property?.tokenPrice;

      if (!property) {
        return res.status(404).json({ error: 'Property not found.' });
      }

      // const amount = property.totalInvestmentPrice;

      // Ensure the property price is valid
      if (!amount || typeof amount !== 'number') {
        return res.status(400).json({ error: 'Property price is invalid or not available.' });
      }

      // Convert the amount to sub-currency (cents)
      const amountInCents = Math.round(amount * 100);

      // Create a PaymentIntent using Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
      });

      // Store payment intent details in the database
      const paymentRecord = await prisma.payment.create({
        data: {
          userId: decoded.userId,
          amount: amount, // Store the amount in main currency (not cents)
          currency: 'usd',
          numberOfTokens: noTokens,
          tokenPrice: property?.tokenPrice,
          propertyId: property.id,
          paymentIntentId: paymentIntent.id,
          status: 'PENDING', // Update this based on webhook events if needed
        },
      });

      // Respond with the client secret for the PaymentIntent
      res.status(200).json({
        message: 'PaymentIntent created successfully.',
        init: paymentIntent?.client_secret,
        values: paymentRecord?.id,
      });
    } catch (error) {
      console.error('Error creating PaymentIntent:', error);

      // Handle specific JWT errors
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Unauthorized. Invalid token.' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Unauthorized. Token has expired.' });
      }

      // Handle Stripe or general errors
      res.status(500).json({
        error: 'Failed to create PaymentIntent. Please try again later.',
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }
}
