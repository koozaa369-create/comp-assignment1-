const db = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Register User
exports.register = async (req, res) => {
  const { username, email, masterPassword } = req.body;
  try {
    const passwordHash = await bcrypt.hash(masterPassword, 10);
    const userSalt = crypto.randomBytes(16).toString('hex'); // Salt สำหรับ PBKDF2 ฝั่ง Client

    await db.query(
      'INSERT INTO users (username, email, master_password_hash, user_salt) VALUES (?, ?, ?, ?)',
      [username, email, passwordHash, userSalt]
    );
    res.json({ success: true, message: 'ลงทะเบียนสำเร็จ' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Login User
exports.login = async (req, res) => {
  const { username, masterPassword } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) return res.status (400).json({ success: false, message: 'ไม่พบผู้ใช้นี้' });

    const user = rows[0];
    const match = await bcrypt.compare(masterPassword, user.master_password_hash);
    if (!match) return res.status(400).json({ success: false, message: 'Master Password ไม่ถูกต้อง' });

    req.session.userId = user.user_id;
    req.session.username = user.username;

    res.json({
      success: true,
      userSalt: user.user_salt, // ส่ง Salt ให้ Client ใช้สร้าง User Key Half
      message: 'เข้าสู่ระบบสำเร็จ'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};