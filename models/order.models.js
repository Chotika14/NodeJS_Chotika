const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId, // เก็บ ID ของสินค้า
        ref: 'products',            // อ้างอิงไปยังโมเดล 'products'
        required: true              // ต้องระบุทุกครั้ง
    },
    quantity: {
        type: Number,
        required: true,             // ต้องระบุจำนวนสินค้า
        min: 1                       // จำนวนสินค้าอย่างน้อย 1
    }
}, { timestamps: true });

module.exports = mongoose.model('orders', orderSchema); // ชื่อโมเดล 'orders'
