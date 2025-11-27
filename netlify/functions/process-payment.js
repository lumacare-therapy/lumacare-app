// netlify/functions/process-payment.js
exports.handler = async (event) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { amountInCents, plan } = JSON.parse(event.body);
    
    if (!amountInCents) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Missing required field: amountInCents' })
      };
    }

    console.log('Processing payment:', { amountInCents, plan });

    // For now, simulate successful payment
    // In production, you would integrate with Yoco API here
    const transactionId = 'yoco_tx_' + Math.random().toString(36).substr(2, 12);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: true, 
        transactionId: transactionId,
        message: 'Payment processed successfully'
      })
    };

  } catch (error) {
    console.error('Payment processing error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: false, 
        error: 'Payment processing error: ' + error.message 
      })
    };
  }
};
