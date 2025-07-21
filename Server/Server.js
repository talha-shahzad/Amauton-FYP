const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io'); // Import socket.io
const { exec } = require('child_process');
const connectDB = require('./config/db'); // Assuming you're using a custom DB connection

const Product = require('./models/Product'); // Adjust the path as necessary
const SellingPartnerAPI = require('amazon-sp-api');
const getAccessToken = require('./Endpoints/getAccessToken');
const fetchAllProductsByKeyword = require('./Endpoints/fetchAllProductsByKeyword.js');
const fetchGoogleProductsByKeyword = require('./Endpoints/dynamicScrapping.js');
const insertProductToMongoDB = require('./db_insertions/insertProductsData.js');
const connectToMongoDB = require('./database.js');
const Scrapper = require('./controllers/scrapper');
const getAmazonFeesForASIN = require('./Endpoints/getAmazonFee.js');


const bcrypt = require("bcryptjs");

const User = require('./models/UserSchema');

const pruneData = require('./Endpoints/pruneFetchedData.js');
const { Description } = require('@mui/icons-material');

dotenv.config();

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');


const app = express();
const PORT = process.env.PORT || 3000;

const server = http.createServer(app); // Create HTTP server

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173', // Your frontend's URL
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'], // Allow headers as necessary
        credentials: true,  // This allows credentials, like cookies, if needed
    },
});

// Enable CORS
app.use(cors());

// Connect to the database
connectDB();

// Middleware to parse JSON data
app.use(express.json());

// Use Routes
app.use('/api', authRoutes);       // /api/signup, /api/login
app.use('/api/user', userRoutes);  // /api/user/:id



// WebSocket handling
io.on('connection', (socket) => {
    console.log('A user connected via WebSocket');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    // Emit a welcome message to the connected socket
    socket.emit('welcome', 'Welcome to the WebSocket server');
});

// (async () => {
//     const keyword = 'laptop';
//     const products = await fetchAllProductsByKeyword(keyword);
//  
//     console.log('Total Products: ', products.length);
//  
//     const { client, db } = await connectToMongoDB();
//  
//     // Insert each product into MongoDB
//     for (const product of products) {
//       await insertProductToMongoDB(db, product, keyword);
//     }
// })();

// Store the results here
let processedResults = null;

// Main function to run the Python script
(async () => {
    const isWindows = process.platform === 'win32';
    const pythonExecutablePath = isWindows ?
        'C:\\Users\\SageTeck\\AppData\\Local\\Programs\\Python\\Python313\\python.exe' :
        'python3';

    const pythonScriptPath = path.join(__dirname, 'python', 'process_data.py');
    const csvFilePath = path.join(__dirname, 'python', 'product_amz.csv');

    exec(`"${pythonExecutablePath}" "${pythonScriptPath}" "${csvFilePath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error.message}`);
            return;
        }

        try {
            processedResults = JSON.parse(stdout); // Store the results for later use
            //console.log("Processed Results:", processedResults);
        } catch (parseError) {
            console.error(`Error parsing output: ${parseError.message}`);
        }
    });
})();

// API endpoint to get the processed results
app.get('/results', (req, res) => {
    console.log("Received request for /results");
    if (processedResults) {
        //       console.log("Sending processed results");
        res.json(processedResults); // Send the results as a JSON response
    } else {
        console.log("Results not available yet");
        res.status(404).json({ error: 'Results not available yet' });
    }
});

// Function to call the Compare API
const callCompareApi = async (requestData) => {
    try {
        const response = await fetch('https://bc95-2407-d000-b-d9a-3cad-c73c-df86-7de0.ngrok-free.app/compare', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Ensure proper content type
            },
            body: JSON.stringify(requestData), // Convert the requestData to JSON
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json(); // Parse the JSON response
        return responseData; // Return the response data
    } catch (error) {
        console.error("Error calling the Compare API:", error.message);
        throw error; // Re-throw the error for handling by the caller
    }
};

app.get('/api/products', async (req, res) => {
    const keyword = req.query.keyword; // Retrieve the keyword from query parameters
    console.log('Received keyword:', keyword); // Log the received keyword

    // Format of Data to send to the API
    const requestDataFlask = {
        image1: "https://m.media-amazon.com/images/I/8122nv6lJlL._AC_SL1500_.jpg",
        image2: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcS5jd9Jng0xL_XPbosjj7yIFR3L_-Nl-niUQDmU6YzsSPTFDtOCztF-Bgj6GJQH0Ms-fhxtG52sj8j9-EhWqIpxvesQn6yb3wvbcdA9lkJr",
        title1: "Corsair K70 RGB PRO Wired Mechanical Gaming Keyboard (Cherry MX RGB Red Switches: Linear and Fast, 8,000Hz Hyper-Polling, PBT Double-Shot PRO Keycaps, Soft-Touch Palm Rest) QWERTY, NA - Black",
        title2: "Corsair K70 RGB PRO Wired Mechanical Gaming Keyboard (Cherry MX RGB Red Switches: Linear and Fast, 8,000Hz Hyper-Polling, PBT Double-Shot PRO Keycaps, Soft-Touch Palm Rest) QWERTY, NA - Black",
        desc1: "desc1",
        desc2: "desc2"
    };
    try {
        let products;

        if (keyword) {
            const regex = new RegExp(keyword, 'i'); // Create a case-insensitive regex pattern
            products = await Product.find({ keywords: regex }); // Fetch products based on the keyword

            // console.log('Fetched filtered products:', products); // Log the fetched filtered products
            // if (products.length === 0) {

            (async () => {
                const products_dAtA = await fetchAllProductsByKeyword(keyword);
                // console.log('Total Products Before: ', fetchedProducts.length);\\
                // const products_dAtA = await pruneData(fetchedProducts);
                console.log('Total Products: ', products_dAtA.length);

                // Connection to database
                const { client, db } = await connectToMongoDB();

                for (const product of products_dAtA) {

                    //   await insertProductToMongoDB(db, product, keyword); // Insert each product into the DB
                    //   console.log('--------------------------------\n')
                    //   console.log("Product from Amazon: ", product)
                    //   console.log('--------------------------------\n')

                    keywords = [keyword]
                    asin = product.asin || null;
                    title = product.summaries?.[0]?.itemName || null;

                    let productData
                    let price
                    let images
                    let googleProducts

                    //checing if product is already stored or not
                    let storedProduct = await db.collection('Products').findOne({ ASIN: asin });

                    if (storedProduct) {
                        console.log(`Product with ASIN ${asin} already exists in the database.`);
                    } else {
                        scrapped_results = await Scrapper(title, asin);

                        Vendors = scrapped_results.vendorData || [];

                        if (Vendors.includes('AMZ')) {
                            console.log("Skipping the product with ASIN: ", asin);
                            continue;
                        }

                        console.log("Scraping product with ASIN: ", asin);

                        BSR = scrapped_results.BSR || '-1';
                        BSR = Number(BSR) || -1;
                        Item_Sold = scrapped_results.ItemSold || '-1';
                        Item_Sold = Number(Item_Sold) || -1;
                        Total_Quantity = scrapped_results.quantity || '-1';
                        Total_Quantity = Number(Total_Quantity) || -1;
                        Rating = scrapped_results.rating || '-1';
                        Rating = Number(Rating) || -1;
                        Reviews = scrapped_results.reviews || '-1';
                        Reviews = Number(Reviews) || -1;
                        scrapped_price = scrapped_results.price;
                        Product_Description = scrapped_results.description || "No Description Found";

                        // Vendors = scrapped_results.vendorData || [];

                        const encoded_title = encodeURIComponent(title);
                        const URL = `https://www.amazon.com/${encoded_title}/dp/${asin}`
                        const listPrice = product.attributes?.list_price?.[0];
                        const bulletPoints = product.attributes.bullet_point || "No Bullet Found";

                        price = {
                            currency: (listPrice && listPrice.currency) || null,
                            value: (listPrice && listPrice.value) || scrapped_price,
                        }


                        console.log("AAAAAAAA Price: ", price);

                        images = [];
                        if (product.images?.[0]?.images) {
                            product.images[0].images.forEach(image => {
                                images.push({
                                    variant: image.variant,
                                    link: image.link,
                                    height: image.height,
                                    width: image.width
                                });
                            });
                        }

                        const productData = {
                            keywords,
                            ASIN: asin,
                            URL,
                            item_name: title,
                            description: Product_Description,
                            bulletPoints: bulletPoints,
                            images,
                            BSR,
                            Item_Sold,
                            Total_Quantity,
                            price,
                            Reviews,
                            Rating,
                            Vendors,
                            brand: product.summaries?.[0]?.brand || null,
                            marketplaceId: product.summaries?.[0]?.marketplaceId || null,
                            manufacturer: product.summaries?.[0]?.manufacturer || null,
                            model_number: product.summaries?.[0]?.modelNumber || null,
                        };
                        console.log("------------ Product Data: \n", productData);

                        // Store the product in the database
                        storedProduct = await insertProductToMongoDB(db, productData);
                        io.emit('data-update', { storedProduct, googleProducts });
                        console.log(`Product with ASIN ${asin} inserted successfully.`);
                    }
                    //console.log("************** ",productData.images[0].link);
                    requestDataFlask.image1 = storedProduct.images[0].link;
                    requestDataFlask.title1 = storedProduct.item_name;
                    requestDataFlask.desc1 = storedProduct.description;

                    amazonFetchedProductPrice = storedProduct.price.value;
                    amazonFetchedProductASIN = storedProduct.ASIN;

                    console.log("amazonFetchedProductPrice: ", amazonFetchedProductPrice)
                    console.log("amazonFetchedProductASIN: ", amazonFetchedProductASIN)

                    // const fees = await getAmazonFeesForASIN(amazonFetchedProductASIN, amazonFetchedProductPrice);
                    // console.log("Amazon Fees Estimate:", fees);

                    // const feesEstimate = fees.payload.FeesEstimateResult.FeesEstimate;
                    // const totalFees = feesEstimate.TotalFeesEstimate.Amount;

                    // let referralFee = 0.0;
                    // let fbaFee = 0.0;

                    // // Loop through FeeDetailList to find specific fees
                    // feesEstimate.FeeDetailList.forEach((fee) => {
                    //     if (fee.FeeType === "ReferralFee") {
                    //     referralFee = fee.FeeAmount.Amount;
                    //     } else if (fee.FeeType === "FBAFees") {
                    //     fbaFee = fee.FeeAmount.Amount;
                    //     }
                    // });

                    let feesEstimate, totalFees;
                    let referralFee = 0.0;
                    let fbaFee = 0.0;
                    try {
                        const fees = await getAmazonFeesForASIN(amazonFetchedProductASIN, amazonFetchedProductPrice);
                        console.log("Amazon Fees Estimate:", fees);

                        feesEstimate = fees.payload.FeesEstimateResult.FeesEstimate;
                        totalFees = feesEstimate.TotalFeesEstimate.Amount;

                        // Loop through FeeDetailList to find specific fees
                        feesEstimate.FeeDetailList.forEach((fee) => {
                            if (fee.FeeType === "ReferralFee") {
                                referralFee = fee.FeeAmount.Amount;
                            } else if (fee.FeeType === "FBAFees") {
                                fbaFee = fee.FeeAmount.Amount;
                            }
                        });

                    } catch {
                        console.log("Error in fetching price!")
                        feesEstimate = 0.0;
                        totalFees = 0.0;
                    }

                    // Display extracted values
                    console.log(`Total Fees Estimate: ${totalFees}`);
                    console.log(`Referral Fee: ${referralFee}`);
                    console.log(`FBA Fee: ${fbaFee}`);

                    // googleProducts = await fetchGoogleProductsByKeyword(storedProduct.item_name);
                    // let googleProducts;
                    try {
                        googleProducts = await fetchGoogleProductsByKeyword(storedProduct.item_name);
                    } catch {
                        console.log("Error in Scrapping Google Shopping")
                        continue;
                    }

                    if (googleProducts.length) {
                        console.log("\n -------------------google fetched stores---------------------- \n");
                        console.log(googleProducts);
                    }

                    function extractPrice(priceString) {
                        // Extract numeric price from strings like "$24.99"
                        let priceMatch = priceString.match(/\d+(\.\d+)?/);
                        return priceMatch ? parseFloat(priceMatch[0]) : 0;
                    }

                    googleProducts.forEach((product) => {
                        product.stores.forEach((store) => {
                            const itemPrice = extractPrice(store.price);
                            const deliveryFee = store.deliveryPrice.includes("Free") ? 0 : extractPrice(store.deliveryPrice);
                            const ProductCost = itemPrice + deliveryFee;
                            const profit = amazonFetchedProductPrice - (ProductCost + totalFees);

                            store.profit = profit.toFixed(2); // Add profit to store object
                            store.ReferalFee = `$${referralFee.toFixed(2)}`;
                            store.fbaFee = `$${fbaFee.toFixed(2)}`;

                        });
                        console.log('--------------------------\n')
                        console.log(product.stores)
                    });


                    var counter = 0;
                    for (const googleProduct of googleProducts) {
                        if (counter < 5) {
                            counter++;
                            requestDataFlask.image2 = googleProduct.image;
                            requestDataFlask.title2 = googleProduct.title;
                            requestDataFlask.desc2 = googleProduct.description;
                            try {

                                // Call the API function
                                const comparisonResult = await callCompareApi(requestDataFlask);
                                // Print the result
                                googleProduct.image_similarity = comparisonResult.image_similarity;
                                googleProduct.images_similar = comparisonResult.images_similar;
                                googleProduct.overall_match = comparisonResult.overall_match;
                                googleProduct.titles_consistent = comparisonResult.titles_consistent;
                                io.emit('data-update', { storedProduct, googleProducts });
                                console.log("Comparison Result:", comparisonResult);
                            } catch (error) {
                                console.error("Failed to fetch comparison result:", error.message);
                            }
                        }
                    }

                    io.emit('data-update', product); // Emit updated products for real-time update
                    console.log('Sending the data ------>>>>>>>>>>')
                    console.log(googleProducts);

                }
            })();

        }
        else {
            products = await Product.find(); // Fetch all products if no keyword is provided
            //   console.log('Fetched all products:', products);

            if (products.length === 0) {
                //        console.log("No products available.");
            }
        }

        res.json(products); // Send products as the response
    } catch (error) {
        console.error('Error fetching products:', error); // Log any errors
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.use('/api/product', productRoutes);    // /api/product/details, /api/product/update
// Start the server using the `http.createServer(app)`
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


