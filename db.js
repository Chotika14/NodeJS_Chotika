const mongoose = require('mongoose')

main().catch((err) => console.log(err))

async function main() {
    console.log(process.env.DB_HOST) // เช็คว่าโหลดค่าได้ไหม
    await mongoose.connect(
        `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
    )
    console.log("Connected DB Success")
}

//เชื่อมต่อฐานข้อมูล MongoDB
//ใช้ environment variables จากไฟล์ .env
//DB_HOST=localhost
//DB_PORT=27017
//DB_NAME=