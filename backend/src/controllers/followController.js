const prisma = require('../models/database');

// Follow a streamer
const followUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { streamerId } = req.params;

    if (followerId === streamerId) {
      return res.status(400).json({ error: 'Bạn không thể tự follow chính mình' });
    }

    // Ensure streamer exists
    const streamer = await prisma.user.findUnique({ where: { id: streamerId } });
    if (!streamer) return res.status(404).json({ error: 'Streamer không tồn tại' });

    const follow = await prisma.follow.upsert({
      where: { followerId_streamerId: { followerId, streamerId } },
      update: {},
      create: { followerId, streamerId },
    });

    return res.json({ message: 'Đã follow', follow });
  } catch (err) {
    console.error('followUser error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Unfollow a streamer
const unfollowUser = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { streamerId } = req.params;

    await prisma.follow.delete({
      where: { followerId_streamerId: { followerId, streamerId } },
    }).catch(() => {});

    return res.json({ message: 'Đã unfollow' });
  } catch (err) {
    console.error('unfollowUser error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// List streamers current user is following
const listFollowings = async (req, res) => {
  try {
    const followerId = req.user.id;
    const follows = await prisma.follow.findMany({
      where: { followerId },
      include: { streamer: { select: { id: true, username: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ followings: follows.map(f => f.streamer) });
  } catch (err) {
    console.error('listFollowings error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// List followers of current user (or query streamerId)
const listFollowers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const streamerId = req.query.streamerId || currentUserId;
    const follows = await prisma.follow.findMany({
      where: { streamerId },
      include: { follower: { select: { id: true, username: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ followers: follows.map(f => f.follower) });
  } catch (err) {
    console.error('listFollowers error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Check if current user is following a streamer
const isFollowing = async (req, res) => {
  try {
    const followerId = req.user.id;
    const { streamerId } = req.params;
    const follow = await prisma.follow.findUnique({
      where: { followerId_streamerId: { followerId, streamerId } },
      select: { id: true },
    });
    return res.json({ isFollowing: !!follow });
  } catch (err) {
    console.error('isFollowing error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  followUser,
  unfollowUser,
  listFollowings,
  listFollowers,
  isFollowing,
};






