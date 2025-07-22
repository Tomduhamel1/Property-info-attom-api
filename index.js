const axios = require('axios');

exports.handler = async (event) => {
  try {
    // Example: extract query parameters or body
    const { address } = JSON.parse(event.body || '{}');

    // Make request to ATTOM or any external API
    const response = await axios.get(`https://api.attomdata.com/property/v2/details`, {
      params: { address },
      headers: {
        apikey: process.env.ATTOM_API_KEY, // You'll use env vars
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};