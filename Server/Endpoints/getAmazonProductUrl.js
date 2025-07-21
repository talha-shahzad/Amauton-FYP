const getAmazonProductUrl = (asin) => {
    return `https://www.amazon.com/dp/${asin}`;
};

module.exports = getAmazonProductUrl