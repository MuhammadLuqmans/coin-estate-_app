import prisma from '@/libs/prisma';
import jwt from 'jsonwebtoken';

// check total Sell
const calculateTotal = (array, field) => {
  return array.reduce((total, item) => total + (item[field] || 0), 0);
};

function getPropertyPayments(propertyId, payments) {
  const paymentList = payments.filter((payment) => payment.propertyId === propertyId);
  return {
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

      // Extract the property ID and amount from the request body
      const { id, amount: noTokens } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Property ID is required.' });
      }

      // Fetch property details using the ID
      const property = await prisma.property.findUnique({
        where: { id },
      });

      if (!property) {
        return res.status(404).json({ error: 'Property not found.' });
      }

      // Get user details for billing information
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          email: true,
          username: true,
          phone: true,
        },
      });

      // Check available tokens
      const paymentList = await prisma.payment.findMany({ where: { status: 'SECCESS' } });
      const remaining = getPropertyPayments(id, paymentList);

      let remainingTokens = property?.totalInvestmentPrice - remaining?.remaining;
      remainingTokens = remainingTokens / property?.tokenPrice;

      if (noTokens >= remainingTokens) {
        return res.status(400).json({ error: "We don't have enough tokens to sale" });
      }

      const amount = noTokens * property?.tokenPrice;

      // Ensure the amount is valid
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount. Please check token quantity.' });
      }

      // Generate unique invoice ID
      const invoice = `INV-${Date.now()}-${decoded.userId.substring(0, 8)}`;

      // Store payment record in database with PENDING status
      const paymentRecord = await prisma.payment.create({
        data: {
          userId: decoded.userId,
          amount: amount, // Store the amount in main currency
          currency: 'cop', // Epayco default currency (Colombian Peso)
          numberOfTokens: noTokens,
          tokenPrice: property?.tokenPrice,
          propertyId: property.id,
          paymentIntentId: invoice, // Use invoice as payment intent ID for Epayco
          status: 'PENDING',
        },
      });

      // Prepare Epayco payment data
      // Convert USD amount to COP if needed (you may want to add currency conversion logic here)
      const amountInCOP = Math.round(amount * 1000); // Assuming 1 USD = 1000 COP, adjust based on your conversion rate
      
      // Return payment data for Epayco checkout
      res.status(200).json({
        message: 'Epayco payment data created successfully.',
        paymentData: {
          name: property.name || 'Property Investment',
          description: `Investment in ${property.name} - ${noTokens} tokens`,
          invoice: invoice,
          currency: 'cop',
          amount: amountInCOP.toString(), // Epayco expects string amount
          tax_base: '0',
          tax: '0',
          country: 'co',
          lang: 'es',
          
          // Store payment record ID in extra fields for later reference
          extra1: paymentRecord.id,
          extra2: property.id,
          extra3: decoded.userId,
          
          // Customer billing information
          name_billing: user?.username || 'User',
          email: user?.email || '',
          mobilephone_billing: user?.phone || '',
          
          // Callback URLs
          confirmation: `${req.headers.origin || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/epayco/confirmation`,
          response: `${req.headers.origin || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/market-place/processing/payment-response`,
        },
        paymentRecordId: paymentRecord.id,
        invoice: invoice,
      });
    } catch (error) {
      console.error('Error creating Epayco payment:', error);

      // Handle specific JWT errors
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'Unauthorized. Invalid token.' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Unauthorized. Token has expired.' });
      }

      // Handle general errors
      res.status(500).json({
        error: 'Failed to create Epayco payment. Please try again later.',
        message: error.message,
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }
}
