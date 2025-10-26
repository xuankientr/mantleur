const prisma = require('../models/database');
const { v4: uuidv4 } = require('uuid');

// Lấy danh sách streams đang live
const getStreams = async (req, res) => {
  try {
    const { category, q, limit = 20, offset = 0, isLive } = req.query;

    const where = {};

    if (category) {
      where.category = category;
    }

    if (q && q.trim().length > 0) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { category: { contains: q } },
        { streamer: { is: { username: { contains: q } } } }
      ];
    }

    // Mặc định chỉ lấy stream đang live nếu không có tham số q và không truyền isLive
    if (typeof isLive !== 'undefined') {
      if (isLive === 'true') where.isLive = true;
      else if (isLive === 'false') where.isLive = false;
    } else if (!q) {
      where.isLive = true;
    }

    const streams = await prisma.stream.findMany({
      where,
      include: {
        streamer: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: {
        viewerCount: 'desc'
      },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json({
      streams,
      total: streams.length
    });

  } catch (error) {
    console.error('Get streams error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Lấy thông tin stream cụ thể
const getStream = async (req, res) => {
  try {
    const { streamId } = req.params;

    const stream = await prisma.stream.findUnique({
      where: { id: streamId },
      include: {
        streamer: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    res.json({ stream });

  } catch (error) {
    console.error('Get stream error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Tạo stream mới
const createStream = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const userId = req.user.id;

    // Validation
    if (!title) {
      return res.status(400).json({ error: 'Stream title is required' });
    }

    // Tạo stream key duy nhất
    const streamKey = `stream_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const stream = await prisma.stream.create({
      data: {
        title,
        description,
        category,
        streamKey,
        streamerId: userId
      },
      include: {
        streamer: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Stream created successfully',
      stream
    });

  } catch (error) {
    console.error('Create stream error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Cập nhật stream
const updateStream = async (req, res) => {
  try {
    const { streamId } = req.params;
    const { title, description, category, isLive, viewerCount } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (isLive !== undefined) updateData.isLive = isLive;
    if (viewerCount !== undefined) updateData.viewerCount = viewerCount;

    const stream = await prisma.stream.update({
      where: { id: streamId },
      data: updateData,
      include: {
        streamer: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    // Nếu isLive chuyển từ false -> true: thông báo tới follower
    if (isLive === true) {
      try {
        const io = req.app.get('io');
        // Lấy danh sách follower của streamer
        const follows = await prisma.follow.findMany({
          where: { streamerId: stream.streamerId },
          select: { followerId: true },
        });
        // Phát sự kiện theo từng user room
        follows.forEach(f => {
          io.to(`user-${f.followerId}`).emit('streamer_live', {
            streamerId: stream.streamerId,
            streamId: stream.id,
            title: stream.title,
            category: stream.category,
          });
        });
      } catch (notifyErr) {
        console.error('notify followers error:', notifyErr);
      }
    }

    res.json({
      message: 'Stream updated successfully',
      stream
    });

  } catch (error) {
    console.error('Update stream error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Xóa stream
const deleteStream = async (req, res) => {
  try {
    const { streamId } = req.params;

    await prisma.stream.delete({
      where: { id: streamId }
    });

    res.json({ message: 'Stream deleted successfully' });

  } catch (error) {
    console.error('Delete stream error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Lấy streams của user
const getUserStreams = async (req, res) => {
  try {
    const userId = req.user.id;

    const streams = await prisma.stream.findMany({
      where: { streamerId: userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ streams });

  } catch (error) {
    console.error('Get user streams error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getStreams,
  getStream,
  createStream,
  updateStream,
  deleteStream,
  getUserStreams
};
