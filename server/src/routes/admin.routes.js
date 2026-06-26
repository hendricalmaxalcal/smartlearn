const express = require('express');
const { getDashboardStats, getAllUsers, updateUserStatus, deleteUser, createAnnouncement, getSubscriptionStats } = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.post('/announcements', createAnnouncement);
router.get('/subscriptions/stats', getSubscriptionStats);

module.exports = router;
