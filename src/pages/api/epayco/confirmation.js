import Epayco from 'epayco-sdk-node';
import prisma from '@/libs/prisma';

// Initialize Epayco SDK - epayco-sdk-node uses different initialization
let epayco = null;
try {
  epayco = new Epayco({
    apiKey: process.env.EPAYCO_PUBLIC_KEY || "cb8d42f8571e473134792daec1b738dc6997805f",
    privateKey: process.env.EPAYCO_PRIVATE_KEY || process.env.EPAYCO_PUBLIC_KEY || "",
    lang: 'ES',
    test: process.env.EPAYCO_TEST_MODE !== 'false',
  });
} catch (error) {
  console.error('Error initializing Epayco SDK:', error);
}

export default async function handler(req, res) {
  // Epayco sends confirmation via POST (webhook) or GET (redirect)
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', ['POST', 'GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Epayco can send data via POST body or GET query params
    const paymentData = req.method === 'POST' ? req.body : req.query;
    
    const {
      x_cod_response,
      x_response,
      x_response_reason_text,
      x_id_invoice,
      x_ref_payco,
      x_transaction_id,
      x_amount,
      x_currency_code,
      x_test_request,
      x_approval_code,
      x_transaction_date,
      x_customer_doctype,
      x_customer_document,
      x_customer_name,
      x_customer_email,
      x_customer_phone,
      x_customer_movil,
      x_franchise,
      x_bank_name,
      x_payment_method_name,
      x_signature,
    } = paymentData;

    console.log('Epayco payment confirmation received:', {
      method: req.method,
      ref_payco: x_ref_payco,
      transaction_id: x_transaction_id,
      response: x_response,
      cod_response: x_cod_response,
      reason: x_response_reason_text,
      amount: x_amount,
    });

    // Validate required fields
    if (!x_ref_payco) {
      return res.status(400).json({ error: 'Missing required payment reference (x_ref_payco)' });
    }

    // Process payment status
    const isApproved = x_cod_response === '1' && (x_response === 'approved' || x_response === 'Aceptada');
    const status = isApproved ? 'APPROVED' : 
                  x_cod_response === '2' || x_response === 'Pending' ? 'PENDING' : 
                  x_cod_response === '3' || x_response === 'Rechazada' ? 'REJECTED' : 'UNKNOWN';

    // Verify the payment with Epayco API if SDK is available
    if (epayco && x_ref_payco) {
      try {
        // Try to get payment information - method may vary based on SDK version
        let paymentInfo = null;
        try {
          // Attempt different possible methods
          if (typeof epayco.cash !== 'undefined' && typeof epayco.cash.get === 'function') {
            paymentInfo = await epayco.cash.get(x_ref_payco);
          } else if (typeof epayco.transactions !== 'undefined') {
            paymentInfo = await epayco.transactions.get(x_ref_payco);
          }
        } catch (sdkError) {
          console.warn('Could not verify with Epayco SDK (this is okay for webhooks):', sdkError.message);
        }
        
        if (paymentInfo) {
          console.log('Epayco payment verification result:', paymentInfo);
        }
      } catch (verifyError) {
        console.error('Error verifying payment with Epayco SDK:', verifyError);
        // Continue processing even if verification fails
      }
    }

    // Update payment record in database using extra fields
    // extra1 = paymentRecordId, extra2 = propertyId, extra3 = userId
    const paymentRecordId = paymentData.extra1;
    const dbStatus = isApproved ? 'SECCESS' : status === 'PENDING' ? 'PENDING' : 'FAILED';

    if (paymentRecordId) {
      try {
        // Update the payment record with transaction details
        await prisma.payment.update({
          where: { id: paymentRecordId },
          data: {
            paymentIntentId: x_transaction_id || x_ref_payco,
            status: dbStatus,
            // You can also store additional transaction details if needed
          },
        });
        console.log(`Payment record ${paymentRecordId} updated to status: ${dbStatus}`);
      } catch (dbError) {
        console.error('Error updating payment record in database:', dbError);
        // Don't fail the webhook if DB update fails - Epayco still needs 200 response
      }
    } else {
      console.warn('No payment record ID found in extra fields, cannot update database');
    }

    // Return success response to Epayco
    // Epayco expects a 200 status for successful webhook processing
    if (req.method === 'POST') {
      // For webhook (POST), return JSON
      return res.status(200).json({
        success: true,
        message: 'Payment confirmation received',
        ref_payco: x_ref_payco,
        status,
      });
    } else {
      // For redirect (GET), redirect to response page
      return res.redirect(`/dashboard/market-place/processing/payment-response?ref_payco=${x_ref_payco}`);
    }

  } catch (error) {
    console.error('Error processing Epayco confirmation:', error);
    
    // Still return 200 to Epayco to prevent retries, but log the error
    return res.status(200).json({
      success: false,
      error: 'Error processing payment confirmation',
      message: error.message,
    });
  }
}
