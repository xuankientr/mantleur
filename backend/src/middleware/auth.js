const jwt = require('jsonwebtoken');
const prisma = require('../models/database');

// Middleware để xác thực JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Lấy thông tin user từ database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        coinBalance: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Middleware để kiểm tra quyền streamer
const requireStreamer = async (req, res, next) => {
  try {
    const { streamId } = req.params;
    
    if (!streamId) {
      return res.status(400).json({ error: 'Stream ID required' });
    }

    const stream = await prisma.stream.findUnique({
      where: { id: streamId },
      include: { streamer: true }
    });

    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    if (stream.streamerId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied. You are not the streamer' });
    }

    req.stream = stream;
    next();
  } catch (error) {
    console.error('Streamer middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  authenticateToken,
  requireStreamer
};



