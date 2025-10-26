const prisma = require('../models/database');

// Cập nhật profile user
const updateProfile = async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (avatar !== undefined) updateData.avatar = avatar;

    // Kiểm tra username đã tồn tại (nếu có thay đổi)
    if (username && username !== req.user.username) {
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        avatar: true,
        coinBalance: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Lấy thông tin user khác
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        avatar: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Lấy thống kê streams
    const streamStats = await prisma.stream.aggregate({
      where: { streamerId: userId },
      _count: {
        id: true
      }
    });

    res.json({
      user: {
        ...user,
        totalStreams: streamStats._count.id
      }
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Lấy lịch sử streams của user
const getUserStreamHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const streams = await prisma.stream.findMany({
      where: { streamerId: userId },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json({ streams });

  } catch (error) {
    console.error('Get user stream history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Nạp coin (mock function - trong thực tế sẽ tích hợp payment gateway)
const addCoins = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        coinBalance: {
          increment: amount
        }
      },
      select: {
        id: true,
        username: true,
        coinBalance: true
      }
    });

    res.json({
      message: 'Coins added successfully',
      newBalance: updatedUser.coinBalance
    });

  } catch (error) {
    console.error('Add coins error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Trừ coin (cho withdrawal)
const deductCoins = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Kiểm tra balance trước khi trừ
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coinBalance: true }
    });

    if (!user || user.coinBalance < amount) {
      return res.status(400).json({ error: 'Insufficient coin balance' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        coinBalance: {
          decrement: amount
        }
      },
      select: {
        id: true,
        username: true,
        coinBalance: true
      }
    });

    res.json({
      message: 'Coins deducted successfully',
      newBalance: updatedUser.coinBalance
    });

  } catch (error) {
    console.error('Deduct coins error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  updateProfile,
  getUserProfile,
  getUserStreamHistory,
  addCoins,
  deductCoins
};




















