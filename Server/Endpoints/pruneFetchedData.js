const getFBM = require('./getProductVendors');

async function pruneProducts(productsData) {
    const prunedProducts = [];
    
    for (const product of productsData) {
        try {
            // Call the API and wait for the result
            const response = await getFBM(product.asin);
            if (response) {
                prunedProducts.push(product); // Include only valid products
            }
            
            // Enforce rate limiting by delaying the next request
            await delay(3000); // 2000ms = 0.5 requests per second
        } catch (error) {
            console.error(`Error processing ASIN ${product.asin}:`, error);
        }
    }
    
    return prunedProducts;
}

// Helper function for introducing delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = pruneProducts;
