const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Lấy danh sách scheduled streams
const getScheduledStreams = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'scheduled' } = req.query;
    const skip = (page - 1) * limit;

    const scheduledStreams = await prisma.scheduledStream.findMany({
      where: {
        status: status,
        scheduledAt: {
          gte: new Date() // Chỉ lấy những stream chưa diễn ra
        }
      },
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
        scheduledAt: 'asc'
      },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    const total = await prisma.scheduledStream.count({
      where: {
        status: status,
        scheduledAt: {
          gte: new Date()
        }
      }
    });

    res.json({
      scheduledStreams,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching scheduled streams:', error);
    res.status(500).json({ error: 'Failed to fetch scheduled streams' });
  }
};

// Lấy scheduled stream theo ID
const getScheduledStream = async (req, res) => {
  try {
    const { id } = req.params;

    const scheduledStream = await prisma.scheduledStream.findUnique({
      where: { id },
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

    if (!scheduledStream) {
      return res.status(404).json({ error: 'Scheduled stream not found' });
    }

    res.json(scheduledStream);
  } catch (error) {
    console.error('Error fetching scheduled stream:', error);
    res.status(500).json({ error: 'Failed to fetch scheduled stream' });
  }
};

// Tạo scheduled stream mới
const createScheduledStream = async (req, res) => {
  try {
    const { title, description, category, thumbnail, scheduledAt, duration } = req.body;
    const streamerId = req.user.id;

    // Validate scheduledAt phải trong tương lai
    const scheduledDate = new Date(scheduledAt);
    if (scheduledDate <= new Date()) {
      return res.status(400).json({ error: 'Scheduled time must be in the future' });
    }

    const scheduledStream = await prisma.scheduledStream.create({
      data: {
        title,
        description,
        category,
        thumbnail,
        scheduledAt: scheduledDate,
        duration: duration ? parseInt(duration) : null,
        streamerId
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

    res.status(201).json(scheduledStream);
  } catch (error) {
    console.error('Error creating scheduled stream:', error);
    res.status(500).json({ error: 'Failed to create scheduled stream' });
  }
};

// Cập nhật scheduled stream
const updateScheduledStream = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, thumbnail, scheduledAt, duration, status } = req.body;
    const streamerId = req.user.id;

    // Kiểm tra quyền sở hữu
    const existingStream = await prisma.scheduledStream.findUnique({
      where: { id }
    });

    if (!existingStream) {
      return res.status(404).json({ error: 'Scheduled stream not found' });
    }

    if (existingStream.streamerId !== streamerId) {
      return res.status(403).json({ error: 'Not authorized to update this stream' });
    }

    // Validate scheduledAt nếu được cung cấp
    let scheduledDate = existingStream.scheduledAt;
    if (scheduledAt) {
      scheduledDate = new Date(scheduledAt);
      if (scheduledDate <= new Date()) {
        return res.status(400).json({ error: 'Scheduled time must be in the future' });
      }
    }

    const updatedStream = await prisma.scheduledStream.update({
      where: { id },
      data: {
        title: title || existingStream.title,
        description: description !== undefined ? description : existingStream.description,
        category: category || existingStream.category,
        thumbnail: thumbnail || existingStream.thumbnail,
        scheduledAt: scheduledDate,
        duration: duration ? parseInt(duration) : existingStream.duration,
        status: status || existingStream.status
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

    res.json(updatedStream);
  } catch (error) {
    console.error('Error updating scheduled stream:', error);
    res.status(500).json({ error: 'Failed to update scheduled stream' });
  }
};

// Xóa scheduled stream
const deleteScheduledStream = async (req, res) => {
  try {
    const { id } = req.params;
    const streamerId = req.user.id;

    // Kiểm tra quyền sở hữu
    const existingStream = await prisma.scheduledStream.findUnique({
      where: { id }
    });

    if (!existingStream) {
      return res.status(404).json({ error: 'Scheduled stream not found' });
    }

    if (existingStream.streamerId !== streamerId) {
      return res.status(403).json({ error: 'Not authorized to delete this stream' });
    }

    await prisma.scheduledStream.delete({
      where: { id }
    });

    res.json({ message: 'Scheduled stream deleted successfully' });
  } catch (error) {
    console.error('Error deleting scheduled stream:', error);
    res.status(500).json({ error: 'Failed to delete scheduled stream' });
  }
};

// Lấy scheduled streams của user
const getUserScheduledStreams = async (req, res) => {
  try {
    const streamerId = req.user.id;
    const { status } = req.query;

    const whereClause = { streamerId };
    if (status) {
      whereClause.status = status;
    }

    const scheduledStreams = await prisma.scheduledStream.findMany({
      where: whereClause,
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
        scheduledAt: 'asc'
      }
    });

    res.json(scheduledStreams);
  } catch (error) {
    console.error('Error fetching user scheduled streams:', error);
    res.status(500).json({ error: 'Failed to fetch user scheduled streams' });
  }
};

// Bắt đầu stream từ scheduled stream
const startScheduledStream = async (req, res) => {
  try {
    const { id } = req.params;
    const streamerId = req.user.id;

    // Kiểm tra scheduled stream
    const scheduledStream = await prisma.scheduledStream.findUnique({
      where: { id }
    });

    if (!scheduledStream) {
      return res.status(404).json({ error: 'Scheduled stream not found' });
    }

    if (scheduledStream.streamerId !== streamerId) {
      return res.status(403).json({ error: 'Not authorized to start this stream' });
    }

    if (scheduledStream.status !== 'scheduled') {
      return res.status(400).json({ error: 'Stream is not in scheduled status' });
    }

    // Tạo stream thực tế
    const streamKey = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const stream = await prisma.stream.create({
      data: {
        title: scheduledStream.title,
        description: scheduledStream.description,
        category: scheduledStream.category,
        thumbnail: scheduledStream.thumbnail,
        streamKey,
        streamerId,
        isLive: true
      }
    });

    // Cập nhật scheduled stream
    const updatedScheduledStream = await prisma.scheduledStream.update({
      where: { id },
      data: {
        status: 'live',
        streamId: stream.id
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

    res.json({
      message: 'Stream started successfully',
      stream,
      scheduledStream: updatedScheduledStream
    });
  } catch (error) {
    console.error('Error starting scheduled stream:', error);
    res.status(500).json({ error: 'Failed to start scheduled stream' });
  }
};


module.exports = {
  getScheduledStreams,
  getScheduledStream,
  createScheduledStream,
  updateScheduledStream,
  deleteScheduledStream,
  getUserScheduledStreams,
  startScheduledStream
};

