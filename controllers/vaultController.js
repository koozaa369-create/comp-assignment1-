const db = require('../config/db');
const crypto = require('crypto');

// ฟังก์ชันรวม Key (Client Key Half + Server Key Half) ด้วย XOR
function combineKeys(clientUserKeyHex, serverKeyHalfHex) {
  const clientKey = Buffer.from(clientUserKeyHex, 'hex');
  const serverKey = Buffer.from(serverKeyHalfHex, 'hex');
  const masterKey = Buffer.alloc(32);
  for (let i = 0; i < 32; i++) {
    masterKey[i] = clientKey[i] ^ serverKey[i];
  }
  return masterKey;
}

// 1. เพิ่มรายการบัญชีใหม่ (Add Account)
exports.addAccount = async (req, res) => {
  const { serviceName, serviceUrl, accountUsername, plainPassword, clientUserKey, notes } = req.body;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อน' });
  }

  try {
    const serverKeyHalf = process.env.SERVER_KEY_HALF;
    const masterKey = combineKeys(clientUserKey, serverKeyHalf);

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', masterKey, iv);

    let encrypted = cipher.update(plainPassword, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    const finalEncrypted = encrypted + authTag;

    // ใส่ category_id เป็น NULL เพื่อรองรับโครงสร้างตารางใน phpMyAdmin
    await db.query(
      `INSERT INTO accounts (user_id, category_id, service_name, service_url, account_username, encrypted_password, iv, notes) 
       VALUES (?, NULL, ?, ?, ?, ?, ?, ?)`,
      [userId, serviceName, serviceUrl || '', accountUsername, finalEncrypted, iv.toString('hex'), notes || '']
    );

    res.json({ success: true, message: 'บันทึกข้อมูลเรียบร้อยแล้ว' });
  } catch (err) {
    console.error("addAccount Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. ดึงรายการทั้งหมดของผู้ใช้ (Get Accounts)
exports.getAccounts = async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อน' });
  }

  try {
    const [rows] = await db.query(
      `SELECT account_id, category_id, service_name, service_url, account_username, encrypted_password, iv, notes 
       FROM accounts 
       WHERE user_id = ? 
       ORDER BY account_id DESC`,
      [userId]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("getAccounts Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. ถอดรหัสผ่านเฉพาะรายการ (Decrypt Password)
exports.decryptPassword = async (req, res) => {
  const { encryptedPassword, ivHex, clientUserKey } = req.body;

  try {
    const serverKeyHalf = process.env.SERVER_KEY_HALF;
    const masterKey = combineKeys(clientUserKey, serverKeyHalf);

    const iv = Buffer.from(ivHex, 'hex');
    const authTagHex = encryptedPassword.slice(-32);
    const cipherTextHex = encryptedPassword.slice(0, -32);

    const decipher = crypto.createDecipheriv('aes-256-gcm', masterKey, iv);
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    let decrypted = decipher.update(cipherTextHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    res.json({ success: true, decryptedPassword: decrypted });
  } catch (err) {
    res.status(400).json({ success: false, message: 'ไม่สามารถถอดรหัสได้ Master Key ไม่ถูกต้อง' });
  }
};

// 4. แก้ไขรายการบัญชี (Update Account)
exports.updateAccount = async (req, res) => {
  const accountId = req.params.id;
  const userId = req.session.userId;
  const { serviceName, serviceUrl, accountUsername, plainPassword, clientUserKey, notes } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อน' });
  }

  try {
    if (plainPassword && plainPassword.trim() !== '') {
      const serverKeyHalf = process.env.SERVER_KEY_HALF;
      const masterKey = combineKeys(clientUserKey, serverKeyHalf);
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv('aes-256-gcm', masterKey, iv);

      let encrypted = cipher.update(plainPassword, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const authTag = cipher.getAuthTag().toString('hex');
      const finalEncrypted = encrypted + authTag;

      await db.query(
        `UPDATE accounts 
         SET service_name = ?, service_url = ?, account_username = ?, encrypted_password = ?, iv = ?, notes = ?
         WHERE account_id = ? AND user_id = ?`,
        [serviceName, serviceUrl, accountUsername, finalEncrypted, iv.toString('hex'), notes, accountId, userId]
      );
    } else {
      await db.query(
        `UPDATE accounts 
         SET service_name = ?, service_url = ?, account_username = ?, notes = ?
         WHERE account_id = ? AND user_id = ?`,
        [serviceName, serviceUrl, accountUsername, notes, accountId, userId]
      );
    }

    res.json({ success: true, message: 'แก้ไขข้อมูลสำเร็จ' });
  } catch (err) {
    console.error("updateAccount Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 5. ลบรายการบัญชี (Delete Account)
exports.deleteAccount = async (req, res) => {
  const accountId = req.params.id;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'กรุณาเข้าสู่ระบบก่อน' });
  }

  try {
    const [result] = await db.query(
      'DELETE FROM accounts WHERE account_id = ? AND user_id = ?',
      [accountId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบรายการ หรือไม่มีสิทธิ์ลบ' });
    }

    res.json({ success: true, message: 'ลบรายการสำเร็จ' });
  } catch (err) {
    console.error("deleteAccount Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};