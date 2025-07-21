/********************************************************************************************
 * This is routing file responsible for routinh the traffic to the rescpected files
 * Starting with including the necessary libraries and files to work with
 * First we include the express server which listen and route the requests to specific files
*********************************************************************************************/
const express = require('express');
const router = express.Router();

const Product = require('../models/Product'); 
const SellingPartnerAPI = require('amazon-sp-api');
const getAccessToken = require('../Endpoints/getAccessToken'); 
const fetchAllProductsByKeyword = require('../Endpoints/fetchAllProductsByKeyword.js');
const insertProductToMongoDB = require('../db_insertions/insertProductsData.js');
const verifyToken = require('../middleware/auth');
const connectToMongoDB = require('../database.js');

router.get('/',verifyToken, async (req, res) => {
    const keyword = req.query.keyword; 
    console.log('Received keyword:', keyword);

    try {
        let products;

        // If a keyword is provided, filter products based on it
        if (keyword) {
            // Using regex for a case-insensitive search
            console.log("))))))))))))))))))))))))))))))))))))))))");
            // Using regex for a case-insensitive search
            // If you want to perform a case-insensitive search
            const regex = new RegExp(keyword, 'i'); // Create a case-insensitive regex pattern

            // Find products where keywords match the regex
            products = await Product.find({ keywords: regex }); // No .toArray() needed
            console.log('Fetched filtered products:', products); // Log the fetched filtered products

            // Check if products array is empty
            if (products.length === 0) {
                
            (async () => {
                const products_dAtA = await fetchAllProductsByKeyword(keyword);
            
                console.log('Total Products: ', products_dAtA.length);
            
                const { client, db } = await connectToMongoDB();
            
                // Insert each product into MongoDB
                for (const product of products_dAtA) {
                await insertProductToMongoDB(db,product,keyword);
                products = await Product.find({ keywords: regex }); // No .toArray() needed
                console.log('Fetched filtered products:', products); // Log the fetched filtered products

                }
            })();

            }
        } else {
            // If no keyword, fetch all products
            products = await Product.find(); // Fetch products from MongoDB
            console.log('Fetched all products:', products); // Log the fetched products
        
            // Check if products array is empty
            if (products.length === 0) {
                console.log("No products available.");
                console.log("____________________________________________________________________________________________");
            }
        }
        
        res.json(products); // Send products as response
    } catch (error) {
        console.error('Error fetching products:', error); // Log any errors
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get product details
router.get('/details',verifyToken, async (req, res) => {
    const { ASIN } = req.query;

    try {
        const { db } = await connectToMongoDB();
        const storedProduct = await db.collection('Products').findOne({ ASIN });
        if (!storedProduct) return res.status(404).json({ message: "Product not found" });
        res.json(storedProduct);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// Update product
router.put('/update',verifyToken, async (req, res) => {
    const updatedProduct = req.body;

    try {
        // Update logic here
        // const result = ...
        const result = true; // placeholder

        if (!result) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product updated", product: result });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;

// Export the router
module.exports = router;
