const express = require('express');
const router = express.Router();
const vaultController = require('../controllers/vaultController');

// บันทึกรหัสผ่านใหม่
router.post('/accounts', vaultController.addAccount);

// ดึงรายการรหัสผ่านทั้งหมด
router.get('/accounts', vaultController.getAccounts);

// ถอดรหัสผ่านเฉพาะรายการ
router.post('/accounts/decrypt', vaultController.decryptPassword);

// แก้ไขรายการบัญชี
router.put('/accounts/:id', vaultController.updateAccount);

// ลบรายการบัญชี
router.delete('/accounts/:id', vaultController.deleteAccount);

module.exports = router;