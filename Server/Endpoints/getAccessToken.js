const axios = require('axios');

const getAccessToken = async () => {
  // Load your credentials from environment variables
  const lwaClientId = process.env.LWA_CLIENT_ID;
  const lwaClientSecret = process.env.LWA_CLIENT_SECRET;
  const refreshToken = process.env.LWA_REFRESH_TOKEN;

  try {
    // Send a POST request to Amazon's LWA endpoint to get an access token
    const response = await axios.post(
      'https://api.amazon.com/auth/o2/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: lwaClientId,
        client_secret: lwaClientSecret,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // Log and return the access token
    const accessToken = response.data.access_token;
    // console.log('Access Token:', accessToken);
    return accessToken;

  } catch (error) {
    // Handle and log errors if the request fails
    console.error('Error getting LWA token:', error.response ? error.response.data : error.message);
  }
};

module.exports = getAccessToken;