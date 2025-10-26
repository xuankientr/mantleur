const express = require('express');
const { 
  createDonation, 
  getUserDonations, 
  getReceivedDonations, 
  getStreamDonations 
} = require('../controllers/donationController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(authenticateToken);

// Donation routes
router.post('/', createDonation);
router.get('/my-donations', getUserDonations);
router.get('/received', getReceivedDonations);
router.get('/stream/:streamId', getStreamDonations);

module.exports = router;




















