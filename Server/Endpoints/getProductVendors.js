const axios = require('axios');
const qs = require('qs'); 
const getAccessToken = require('./getAccessToken'); 

const SELLING_PARTNER_API_URL = 'https://sellingpartnerapi-na.amazon.com';
const MARKETPLACE_ID = 'ATVPDKIKX0DER'; 

const checkFBM = async (asin) => {
  const ACCESS_TOKEN = await getAccessToken();

  const url = `${SELLING_PARTNER_API_URL}/products/pricing/v0/items/${asin}/offers`;

  const params = {
    MarketplaceId: MARKETPLACE_ID,
    ItemCondition: 'New', // You can adjust this as needed
    CustomerType: 'Consumer', // Can be 'Consumer' or 'Business'
  };
  
  try {
    const response = await axios.get(url, {
      headers: {
        'x-amz-access-token': ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
      params: params,
      paramsSerializer: params => {
        return qs.stringify(params, { arrayFormat: 'brackets' });
      },
    });

    //console.log('response.data.payload : ' , response.data.payload);

    if (response.data && response.data.payload) {
      const offers = response.data.payload.Offers || [];
      
      // Check if FBM sellers exist
    //   const fbmSellers = offers.filter(offer => !offer.IsFulfilledByAmazon); // FBM sellers are not FBA
    //   const fbmCount = fbmSellers.length;
        
    //   const fbmSellers = offers.filter(offer => 
    //     !offer.IsFulfilledByAmazon && 
    //     (!offer.PrimeInformation || !offer.PrimeInformation.IsPrime)
    //   );
      

      const fbmSellers = offers.every(offer => 
        !offer.IsFulfilledByAmazon && 
        (!offer.PrimeInformation || !offer.PrimeInformation.IsPrime)
      );

      //const fbmCount = fbmSellers.length;

      // console.log(` FBM Sellers: ` , fbmSellers)
      //console.log(` FBM Count: ` , fbmCount)



      if (fbmSellers) {
        // console.log(`FBM Sellers Found for ASIN ${asin}`);
        return true; // FBM sellers exist
      } else {
        // console.log(`No FBM Sellers Found for ASIN ${asin}`);
        return false; // No FBM sellers
      }
    } else {
      // console.log(`No offers found for ASIN: ${asin}`);
      return false;
    }
  } catch (error) {
    console.error('Error fetching sellers:', error.response ? error.response.data : error.message);
    return false;
  }
};

module.exports = checkFBM;
