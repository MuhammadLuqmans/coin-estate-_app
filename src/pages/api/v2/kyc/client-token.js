// import complycube from '@/utils/complycube';
// import { runMiddleware } from '@/utils/cors';

import complycube from '@/libs/complycube';
import cors, { runMiddleware } from '@/utils/cors';

// Initialize ComplyCube API with the API key from the environment variables

export default async function handler(req, res) {
  // Run the middleware
  // console.log('✅ ComplyCube:', complycube.client, complycube.token);

  await runMiddleware(req, res, cors);

  if (req.method === 'POST') {
    try {
      const { email, firstName, lastName } = req.body;

      // Return an error if required parameters are missing
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters',
        });
      }

      // Create a client using the ComplyCube API
      const client = await complycube.client.create({
        type: 'person',
        email,
        personDetails: {
          firstName,
          lastName,
        },
      });

      // Generate an SDK token for the client
      const token = await complycube.token.generate(client.id, {
        referrer: process.env.REFERRER_WEBSITE || 'https://coin-estate.vercel.app/*',
      });
      // console.log("🚀 ~ handler ~ token:", token)

      return res.status(200).json({
        success: true,
        client,
        token: token,
      });
    } catch (error) {
      console.error('Error creating client and generating token:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to create client and generate token',
      });
    }
  }

  // Return 405 for other methods
  return res.status(405).json({ error: 'Method not allowed' });
}
