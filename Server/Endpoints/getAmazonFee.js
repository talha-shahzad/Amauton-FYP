const axios = require('axios');
const getAccessToken = require('./getAccessToken');

const endpoint = 'https://sellingpartnerapi-na.amazon.com';
const marketplaceId = 'ATVPDKIKX0DER'; // Change if needed

async function getAmazonFeesForASIN(asin, price) {
    try {
        const accessToken = await getAccessToken();
        console.log("Access Token in Fee: ", accessToken);

        const url = `${endpoint}/products/fees/v0/items/${asin}/feesEstimate`;

        const body = {
            FeesEstimateRequest: {
                MarketplaceId: marketplaceId,
                Identifier: asin,
                PriceToEstimateFees: {
                    ListingPrice: {
                        Amount: price,
                        CurrencyCode: "USD"
                    }
                },
                IsAmazonFulfilled: true
            }
        };

        const headers = {
            'Authorization': `Bearer ${accessToken}`,
            'x-amz-access-token': accessToken,
            'Content-Type': 'application/json',
            'x-amz-date': new Date().toISOString(),
            'user-agent': 'AmautonApp/1.0 (Language=JavaScript; Platform=Node.js)'
        };

        const response = await axios.post(url, body, { headers });

        return response.data;
    } catch (error) {
        console.error('Error fetching Amazon fees:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
        return null;
    }
}

module.exports = getAmazonFeesForASIN;