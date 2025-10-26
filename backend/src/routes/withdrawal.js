const express = require('express');
const { createWithdrawal, getWithdrawals, updateWithdrawalStatus } = require('../controllers/withdrawalController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes need authentication
router.use(authenticateToken);

// Withdrawal routes
router.post('/', createWithdrawal);
router.get('/', getWithdrawals);
router.put('/:id/status', updateWithdrawalStatus);

module.exports = router;
