const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { followUser, unfollowUser, listFollowings, listFollowers, isFollowing } = require('../controllers/followController');

// Require auth for all follow routes
router.use(authenticateToken);

// Follow a streamer
router.post('/:streamerId', followUser);

// Unfollow a streamer
router.delete('/:streamerId', unfollowUser);

// List streamers current user is following
router.get('/me/followings', listFollowings);

// List followers of current user (or by query streamerId)
router.get('/me/followers', listFollowers);

// Check if current user is following a streamer
router.get('/is-following/:streamerId', isFollowing);

module.exports = router;


