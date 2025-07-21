const dbName = 'Amazon'; 
const collectionName = 'Products';

async function insertProductToMongoDB(db, productData) {
    const collection = db.collection(collectionName);

// Insert into the collection
const result = await collection.insertOne(productData);
console.log('Product inserted into MongoDB:', productData.ASIN);

// Return the inserted product
return productData;
}

module.exports = insertProductToMongoDB;