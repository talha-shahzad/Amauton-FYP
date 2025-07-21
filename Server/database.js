const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();  

const uri = process.env.DB;
const dbName = 'Amazon'; 
const collectionName = 'Products';

async function connectToMongoDB() {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    return { client, db };
  }

module.exports = connectToMongoDB
