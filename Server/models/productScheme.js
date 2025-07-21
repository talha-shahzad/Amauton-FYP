const mongoose = require('mongoose');

// Define the product schema
const productSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  keywords: [String],
  ASIN: String,
  URL: String,
  item_name: String,
  images: [
    {
      variant: String,
      link: String,
      height: Number,
      width: Number
    }
  ],
  BSR: Number,
  Item_Sold: Number,
  Total_Quantity: Number,
  price: {
    currency: String,
    value: Number
  },
  Reviews: Number,
  Rating: Number,
  Vendors: [String],
  brand: String,
  marketplaceId: String,
  manufacturer: String,
  model_number: String // Removed $numberLong since Mongoose doesn't support it directly
});

module.exports = productSchema;
