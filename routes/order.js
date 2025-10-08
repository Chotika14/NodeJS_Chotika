const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const Order = require('../models/order.models'); // โมเดล Order
const Product = require('../models/product.models'); // โมเดล Product



// ---------- GET /products/:id/orders ------------

router.get('/products/:id/orders', async (req, res) => {
  const productId = req.params.id;

  // ตรวจสอบว่ารหัสสินค้าเป็น ObjectId ถูกต้องหรือไม่
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ success: false, message: 'รหัสสินค้าไม่ถูกต้อง' });
  }

  try {
    // ดึงออเดอร์ทั้งหมดของสินค้านี้ พร้อมข้อมูลสินค้า
    const orders = await Order.find({ productId });

    if (!orders.length) {
      return res.status(404).json({ success: false, message: 'ไม่พบออเดอร์สำหรับสินค้านี้' });
    }

    res.json({ status:"200", message: 'success', data: orders });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูล' });
  }
});


//-------------- GET all orders ----------------------------------

router.get('/orders', async (req, res) => {
  try {
    // ดึงออเดอร์ทั้งหมด พร้อมข้อมูลสินค้า
    const orders = await Order.find({});
    
    if (!orders.length) {
      return res.status(404).json({ success: false, message: 'ไม่พบออเดอร์' });
    }

    res.json({ status:"200", message: 'success', data: orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการดึงข้อมูลออเดอร์' });
  }
});

module.exports = router;


