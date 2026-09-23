const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const vaultRoutes = require('./routes/vaultRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 }
}));

// ใช้งาน Routes
// เปลี่ยนเส้นทางหน้าแรก (/) ให้เด้งไปที่หน้า login.html
app.get('/', (req, res) => {
  res.redirect('/login.html');
});
app.use('/api', authRoutes);  // จะได้ Endpoint: /api/register, /api/login
app.use('/api', vaultRoutes); // จะได้ Endpoint: /api/accounts, /api/accounts/decrypt

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});