const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: { type: String, required: true },
    password: { type: String, required: true },
    approved: { type: Boolean, default: false } // เพิ่ม field approved
}, { 
    timestamps: true 
});

module.exports = mongoose.model('users', userSchema);
