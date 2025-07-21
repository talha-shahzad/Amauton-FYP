const { sign } = require('aws4');
const axios = require('axios');
const getAccessToken = require('./getAccessToken');

const MAX_PRODUCTS = 10;
const MAX_PAGE_SIZE = 10;
const MAX_CONCURRENT_REQUESTS = 5; // Limit to avoid overloading the server

const fetchAllProductsByKeyword = async (keyword) => {
    const accessToken = await getAccessToken();
    const endpoint = 'sellingpartnerapi-na.amazon.com';
    const path = '/catalog/2022-04-01/items';
    const marketplaceId = 'ATVPDKIKX0DER';
    const includedData = 'identifiers,attributes,classifications,summaries,images,salesRanks';
    const locale = 'en_US';

    const uniqueAsins = new Set();
    let allProducts = [];
    let taskQueue = []; // Queue for concurrent requests
    let nextToken = null;

    const fetchPage = async (nextToken) => {
        try {
            const timestamp = new Date().toISOString();
            let queryString = `?keywords=${encodeURIComponent(keyword)}&includedData=${encodeURIComponent(includedData)}&locale=${locale}&marketplaceIds=${marketplaceId}&pageSize=${MAX_PAGE_SIZE}&timestamp=${timestamp}`;

            if (nextToken) {
                queryString += `&pageToken=${encodeURIComponent(nextToken)}`;
            }

            const options = {
                host: endpoint,
                path: path + queryString,
                method: 'GET',
                headers: {
                    'x-amz-access-token': accessToken,
                    'Content-Type': 'application/json',
                },
            };

            // Sign the request
            sign(options, {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                region: 'us-east-1',
                service: 'execute-api',
            });

            const response = await axios({
                method: options.method,
                url: `https://${endpoint}${path}${queryString}`,
                headers: options.headers,
            });

            const products = response.data.items || [];

            // Add unique ASINs only
            products.forEach(product => {
                const asin = product.asin;
                if (!uniqueAsins.has(asin)) {
                    uniqueAsins.add(asin);
                    allProducts.push(product);
                }
            });

            console.log('Fetched products so far:', allProducts.length);

            // Return next token for pagination
            return response.data.pagination?.nextToken || null;
        } catch (error) {
            console.error('Error fetching products:', error.response ? error.response.data : error.message);
            return null; // Return null to handle gracefully
        }
    };

    // Queue handler to limit concurrency
    const runTaskQueue = async (tasks) => {
        const results = [];
        while (tasks.length) {
            const currentBatch = tasks.splice(0, MAX_CONCURRENT_REQUESTS); // Take a batch of tasks
            const batchResults = await Promise.all(currentBatch.map(task => task()));
            results.push(...batchResults);
        }
        return results;
    };

    // Add initial task
    do {
        taskQueue.push(() => fetchPage(nextToken));
        nextToken = await fetchPage(nextToken);

        if (allProducts.length >= MAX_PRODUCTS) break;
    } while (nextToken);

    // Run queued tasks with concurrency
    const tokens = await runTaskQueue(taskQueue);

    // Retrieve additional pages from tokens
    for (const token of tokens) {
        if (token && allProducts.length < MAX_PRODUCTS) {
            taskQueue.push(() => fetchPage(token));
        }
    }

    // Finalize with limited products
    return allProducts.slice(0, MAX_PRODUCTS);
};

module.exports = fetchAllProductsByKeyword;
