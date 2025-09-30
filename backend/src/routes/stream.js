const express = require('express');
const { 
  getStreams, 
  getStream, 
  createStream, 
  updateStream, 
  deleteStream, 
  getUserStreams 
} = require('../controllers/streamController');
const { authenticateToken, requireStreamer } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getStreams);
router.get('/:streamId', getStream);

// Protected routes
router.use(authenticateToken);

router.post('/', createStream);
router.get('/user/streams', getUserStreams);

// Streamer-only routes
router.put('/:streamId', requireStreamer, updateStream);
router.delete('/:streamId', requireStreamer, deleteStream);

module.exports = router;



