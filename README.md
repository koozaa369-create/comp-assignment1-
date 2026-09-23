# 🔐 KeyVault - Web Password Manager

**KeyVault** คือเว็บแอปพลิเคชันจัดการและจัดเก็บรหัสผ่านอย่างปลอดภัย พัฒนาด้วย Node.js, Express และ MySQL มีจุดเด่นด้านความปลอดภัยด้วยการใช้เทคโนโลยี **Half-Key Split Architecture** ร่วมกับอัลกอริทึม **AES-256-GCM** ในการเข้ารหัสข้อมูลรหัสผ่านฝั่ง Server และ Client

---

## 🛠️ Tech Stack & Technologies

* **Frontend:** HTML5, Tailwind CSS (via CDN), JavaScript (ES6+), FontAwesome Icons
* **Backend:** Node.js, Express.js
* **Database:** MySQL / MariaDB (via `mysql2` driver)
* **Authentication & Security:** 
  * `crypto` (Built-in Node.js module) สำหรับการทำ AES-256-GCM
  * Express Session สำหรับจัดการ Session ผู้ใช้งาน

---

## 📂 โครงสร้างโฟลเดอร์ของโปรเจกต์ (Project Structure)

```text
keyvault-password-manager/
├── config/
│   └── db.js                 # ไฟล์เชื่อมต่อฐานข้อมูล MySQL
├── controllers/
│   └── vaultController.js    # Logic หลัก (CRUD Accounts, Encrypt/Decrypt, XOR Key Combination)
├── routes/
│   └── vaultRoutes.js       # API Endpoints สำหรับจัดการบัญชีรหัสผ่าน
├── public/
│   ├── dashboard.html        # หน้าจอ Dashboard แสดงรายการรหัสผ่าน
│   └── login.html            # หน้าเข้าสู่ระบบ
├── .env                      # ไฟล์เก็บค่า Environment Variables (เช่น SERVER_KEY_HALF)
├── .gitignore                # กำหนดไฟล์ที่ไม่ต้องการ Push ขึ้น Git
├── index.js                  # ไฟล์หลักสำหรับรัน Express Server
└── package.json              # ไฟล์จัดการ Dependencies
