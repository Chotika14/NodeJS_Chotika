var express = require('express');
var router = express.Router();
var userSchema = require('../models/user.models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



//------------------- register -----------------------------------------

router.post('/register', async (req, res) => {
  try {
    let { name, password } = req.body; //ข้อมูลที่ถูกส่งมา

    // ตรวจสอบว่ามี user อยู่แล้วหรือยัง
    const existingUser = await userSchema.findOne({ name });
    if (existingUser) {
      return res.status(400).json({ status: 400, message: 'มีผู้ใช้งานนี้ในระบบแล้ว' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); //แปลงรหัสผ่าน โดยสุ่มค่า 10 ครั้ง

    const user = new userSchema({ //สร้าง user ใหม่
      name,
      password: hashedPassword,
      approved: false
    });

    await user.save(); //บันทึกลงฐานข้อมูล

    // สร้างแอคผ่านเเล้วแสดงข้อมูล
    res.status(201).json({
      status: 201,
      success: "success",
      data: { id: user._id, name: user.name, approved: user.approved }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//------------------- login ----------------------------------------------------


router.post('/login', async (req, res) => {
  try {
    const { name, password } = req.body; //ข้อมูลที่ถูกส่งมา

    const user = await userSchema.findOne({ name }); //ตรวจสอบว่ามี user อยู่ในระบบหรือไม่
    if (!user) {
      return res.status(401).json({ status: '401', message: 'Invalid username or password', data: null });
    }

    //สอบว่า password ที่ผู้ใช้กรอกตอน login ตรงกับ password ที่เก็บ (hash) ใน database หรือไม่
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ status: '401', message: 'Invalid username or password', data: null });
    }

    // ตรวจสอบว่า user ได้รับการอนุมัติหรือไม่
    if (!user.approved) {
      return res.status(401).json({ status: '401', message: 'User not approved yet',  data: null });
    }

    // สร้าง token ใหม่
    const token = jwt.sign({ id: user._id }, "1234");

    // login เเล้วเเสดงข้อมูล
    res.json({
      status: '200',
      message: 'Success',
      data: { id: user._id, name: user.name, token }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: '500', message: 'Server error' ,data: null});
  }
});

// ------------------- approve user -----------------------------------------


router.put('/users/:id/approve', async (req, res) => {
  try {

    //ค้นหา user ตาม id ที่ส่งมาใน URL
    const user = await userSchema.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // อนุมัติ user
    user.approved = true;
    await user.save();
    
    res.json({ 
      status: '200', 
      message: 'success', 
      user: { id: user._id, name: user.name, approved: user.approved } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
