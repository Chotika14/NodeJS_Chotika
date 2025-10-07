// products.models.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// products.models.js
const productsSchema = new Schema({
    nameproduct: { type: String },
    price: { type: Number },
    stock: { type: Number },
}, { timestamps: true });

module.exports = mongoose.model('products', productsSchema); // ชื่อโมเดล 'products'


