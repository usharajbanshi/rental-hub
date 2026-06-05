const express = require('express');
const router = express.Router();
const { register, login, logout, getMe } = require('../controllers/authController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const User = require('../models/User');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);

// Admin only routes
router.get('/users', protect, authorize('admin'), async (req, res) => {
  const users = await User.find().sort('-createdAt');
  res.status(200).json({ success: true, users });
});

router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'User deleted' });
});

module.exports = router;