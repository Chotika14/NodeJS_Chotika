const express = require('express');
const router = express.Router();
const productsSchema = require('../models/product.models'); // โมเดลสินค้า
const Order = require('../models/order.models'); // โมเดล Order
const tokenMiddleware = require('../middleware/token.middleware'); // Middleware ตรวจสอบ token
const mongoose = require('mongoose'); // 


// GET all products
router.get('/', tokenMiddleware, async (req, res) => {
    try {
        const products = await productsSchema.find(); // ดึงสินค้าทั้งหมด
        res.status(200).json({
            status: 200,
            success: "success",
            data: products
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: 500,
            success: false,
            message: 'Failed to fetch products'
        });
    }
});

// --------------- POST สร้างสินค้าใหม่ -------------

router.post('/', tokenMiddleware,async (req, res) => {
    try {
        console.log("Body:", req.body); // debug ดูว่ามีค่ามั้ย

        let { nameproduct, price, stock } = req.body;

        // สร้างสินค้าใหม่
        const product = new productsSchema({
            nameproduct,
            price,
            stock
        }); 

        await product.save();

        res.status(201).json({
            status: 201,
            success: "success",
            data: { product }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// -------------- PUT อัพเดต/แก้ไข สินค้าโดย ID -------
router.put('/:id', tokenMiddleware, async (req, res) => {
    try {
        let { id } = req.params;
        let { nameproduct, price, stock } = req.body;

            // อัพเดตสินค้า
        let updatedProduct = await productsSchema.findByIdAndUpdate(
            id,
            { nameproduct, price, stock },
            { new: true }
        );
            // ถ้าไม่เจอสินค้า
        if (!updatedProduct) {
            return res.status(400).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            status: 200,
            success: "success",
            data: updatedProduct
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "error",
            error: err.message
        });
    }
});

// ---------- DELETE product by ID --------

router.delete('/:id',tokenMiddleware, async (req, res) => {
    try {
        const { id } = req.params; // รับค่า id จาก URL

        // ลบสินค้าจากฐานข้อมูลตาม id
        const product = await productsSchema.findByIdAndDelete(id);

        // ถ้าไม่เจอสินค้า
        if (!product) {
            return res.status(400).json({
                success: false,
                message: "ไม่พบสินค้า"
            });
        }

        // ถ้าลบสำเร็จ
        res.status(200).json({
            status: 200,
            success: "success",
            data: product
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดในระบบ",
            error: err.message
        });
    }
});

// ---------- GET แสดงสินค้าตาม ID ---------------

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // ตรวจสอบว่า id เป็น ObjectId ของ MongoDB หรือไม่
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: 'Invalid product ID'
            });
        }

        const product = await productsSchema.findById(id); // ดึงสินค้าตาม id

        if (!product) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            status: 200,
            success: true,
            data: product
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: 500,
            success: false,
            message: 'Failed to fetch product'
        });
    }
});

// ------- POST เพิ่ม product ลงprder และลด stock ----------------

router.post('/:id/orders', async (req, res) => {
    try {
        const productId = req.params.id; // รับ productId จาก URL
        const { quantity } = req.body;   // รับ quantity จาก body

        //ตรวจสอบความถูกต้องของจำนวนสินค้า ว่าไม่เป็น 0, ลบ หรือไม่ถูกส่งมา
        if (!quantity || quantity <= 0) {
            return res.status(400).json({ success: false, message: 'กรุณาระบุ quantity ที่ถูกต้อง' });
        }

        // ดึงข้อมูลสินค้า
        const product = await productsSchema.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'ไม่พบสินค้า' });
        }

        // ตรวจสอบ stock
        if (product.stock < quantity) {
            return res.status(400).json({ success: false, message: 'จำนวนสินค้าไม่เพียงพอ' });
        }

        // สร้าง order ใหม่
        const newOrder = new Order({
            productId,
            quantity
        });

        await newOrder.save();

        // ลด stock ของสินค้า
        product.stock -= quantity;
        await product.save();

        res.status(201).json({
            status: 201,
            success: "success",
            order: newOrder,
            remainingStock: product.stock
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'เกิดข้อผิดพลาดในการเพิ่ม order',
            error: err.message
        });
    }
});

module.exports = router;
