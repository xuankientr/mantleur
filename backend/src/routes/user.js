const express = require('express');
const { updateProfile, getUserProfile, getUserStreamHistory, addCoins, deductCoins } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(authenticateToken);

// User profile routes
router.put('/profile', updateProfile);
router.post('/add-coins', addCoins);
router.post('/deduct-coins', deductCoins);

// Public user info routes
router.get('/:userId', getUserProfile);
router.get('/:userId/streams', getUserStreamHistory);

module.exports = router;




















