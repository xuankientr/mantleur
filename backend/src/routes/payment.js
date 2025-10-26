const express = require('express');
const { 
  createPayment,
  paymentReturn,
  getTransactionHistory,
  getUserBalance
} = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Payment callback doesn't need authentication (VNPay calls this)
router.get('/return', paymentReturn);

// All other routes need authentication
router.use(authenticateToken);

// Payment routes
router.post('/create', createPayment);
router.get('/history/:userId?', getTransactionHistory);
router.get('/balance/:userId?', getUserBalance);

module.exports = router;