const express = require('express');
const { 
  getScheduledStreams, 
  getScheduledStream, 
  createScheduledStream, 
  updateScheduledStream, 
  deleteScheduledStream, 
  getUserScheduledStreams,
  startScheduledStream
} = require('../controllers/scheduledStreamController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getScheduledStreams);
router.get('/:id', getScheduledStream);

// Protected routes
router.use(authenticateToken);

router.post('/', createScheduledStream);
router.get('/user/my-schedules', getUserScheduledStreams);
router.put('/:id', updateScheduledStream);
router.delete('/:id', deleteScheduledStream);
router.post('/:id/start', startScheduledStream);


module.exports = router;

