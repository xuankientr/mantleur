const prisma = require('../models/database');

// Tạo donation
const createDonation = async (req, res) => {
  try {
    const { streamId, amount, message } = req.body;
    const donorId = req.user.id;

    // Validation
    if (!streamId || !amount) {
      return res.status(400).json({ error: 'Stream ID and amount are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Donation amount must be positive' });
    }

    if (amount > req.user.coinBalance) {
      return res.status(400).json({ error: 'Insufficient coin balance' });
    }

    // Kiểm tra stream tồn tại
    const stream = await prisma.stream.findUnique({
      where: { id: streamId },
      include: { streamer: true }
    });

    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    if (stream.streamerId === donorId) {
      return res.status(400).json({ error: 'Cannot donate to your own stream' });
    }

    // Sử dụng transaction để đảm bảo tính nhất quán
    const result = await prisma.$transaction(async (tx) => {
      // Trừ coin từ donor
      const updatedDonor = await tx.user.update({
        where: { id: donorId },
        data: {
          coinBalance: {
            decrement: amount
          }
        }
      });

      // Cộng coin cho streamer
      await tx.user.update({
        where: { id: stream.streamerId },
        data: {
          coinBalance: {
            increment: amount
          }
        }
      });

      // Tạo donation record
      const donation = await tx.donation.create({
        data: {
          amount,
          message,
          donorId,
          streamId,
          streamerId: stream.streamerId
        },
        include: {
          donor: {
            select: {
              id: true,
              username: true,
              avatar: true
            }
          },
          stream: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      return { donation, updatedDonor };
    });

    // Emit realtime events to stream room
    try {
      const io = req.app.get('io');
      if (io) {
        const room = `stream-${streamId}`;
        io.to(room).emit('donation', {
          id: result.donation.id,
          amount: result.donation.amount,
          message: result.donation.message,
          donor: result.donation.donor,
          stream: result.donation.stream,
          createdAt: new Date().toISOString()
        });
        // Update balances for donor/streamer (client-side can refresh)
        io.to(room).emit('donation-balance-update', {
          donorId,
          streamerId: stream.streamerId,
          amount
        });
      }
    } catch (e) {
      console.warn('Socket emit donation failed:', e?.message || e);
    }

    res.status(201).json({
      message: 'Donation created successfully',
      donation: result.donation,
      newBalance: result.updatedDonor.coinBalance
    });

  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Lấy lịch sử donations của user
const getUserDonations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const donations = await prisma.donation.findMany({
      where: { donorId: userId },
      include: {
        stream: {
          select: {
            id: true,
            title: true
          }
        },
        streamer: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json({ donations });

  } catch (error) {
    console.error('Get user donations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Lấy donations nhận được của streamer
const getReceivedDonations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    const donations = await prisma.donation.findMany({
      where: { streamerId: userId },
      include: {
        donor: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        },
        stream: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json({ donations });

  } catch (error) {
    console.error('Get received donations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Lấy donations của một stream cụ thể
const getStreamDonations = async (req, res) => {
  try {
    const { streamId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const donations = await prisma.donation.findMany({
      where: { streamId },
      include: {
        donor: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json({ donations });

  } catch (error) {
    console.error('Get stream donations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createDonation,
  getUserDonations,
  getReceivedDonations,
  getStreamDonations
};




