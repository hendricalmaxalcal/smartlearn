const express = require('express');
const {
  register,
  login,
  refresh,
  forgotPassword,
  resetPassword,
  getMe,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe);

module.exports = router;