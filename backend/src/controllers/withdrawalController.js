const prisma = require('../models/database');

// Create withdrawal request
const createWithdrawal = async (req, res) => {
  try {
    const { coinAmount, method, accountInfo, bankAccount, bankName } = req.body;
    const userId = req.userId;

    if (!coinAmount || coinAmount <= 0) {
      return res.status(400).json({ error: 'Invalid coin amount' });
    }

    // Check user balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { coinBalance: true }
    });

    if (!user || user.coinBalance < coinAmount) {
      return res.status(400).json({ error: 'Insufficient coin balance' });
    }

    // Create withdrawal request
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: userId,
        coinAmount: parseInt(coinAmount),
        amount: parseInt(coinAmount) * 100, // 100 coins = 10,000 VNĐ (1 coin = 100 VND)
        method: method || 'bank_transfer',
        accountName: accountInfo || 'User withdrawal request',
        bankAccount: bankAccount || null,
        bankName: bankName || null,
        status: 'pending'
      }
    });

    // Deduct coins from user balance
    await prisma.user.update({
      where: { id: userId },
      data: {
        coinBalance: {
          decrement: parseInt(coinAmount)
        }
      }
    });

    console.log(`✅ Withdrawal request created - ID: ${withdrawal.id}, User: ${userId}, Amount: ${coinAmount} coins`);

    res.status(201).json({
      id: withdrawal.id,
      coinAmount: withdrawal.coinAmount,
      vndAmount: withdrawal.amount,
      status: withdrawal.status,
      message: 'Withdrawal request submitted successfully. Admin will process it.'
    });

  } catch (error) {
    console.error('Error creating withdrawal request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get withdrawals (for admin or user)
const getWithdrawals = async (req, res) => {
  try {
    const userId = req.userId;
    const { status, limit = 50, offset = 0 } = req.query;

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, username: true }
    });

    const isAdmin = user?.email === 'admin@example.com' || user?.username === 'admin';

    // If admin, get all withdrawals; if not, get only user's withdrawals
    const where = isAdmin ? {} : { userId };
    if (status) {
      where.status = status;
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            coinBalance: true
          }
        }
      }
    });

    console.log(`📊 Fetched ${withdrawals.length} withdrawals for ${isAdmin ? 'admin' : 'user'} ${userId}`);

    res.json(withdrawals);

  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update withdrawal status (admin only)
const updateWithdrawalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    console.log('🔧 Update withdrawal status - ID:', id, 'Status:', status);

    if (!['pending', 'approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if withdrawal exists
    const existingWithdrawal = await prisma.withdrawal.findUnique({
      where: { id: id }
    });

    if (!existingWithdrawal) {
      console.log('❌ Withdrawal not found:', id);
      return res.status(404).json({ error: 'Withdrawal not found' });
    }

    console.log('✅ Withdrawal found:', existingWithdrawal.id);

    const withdrawal = await prisma.withdrawal.update({
      where: { id: id },
      data: {
        status,
        adminNote: adminNote || null,
        processedAt: new Date()
      }
    });

    // If rejected, return coins to user
    if (status === 'rejected') {
      await prisma.user.update({
        where: { id: withdrawal.userId },
        data: {
          coinBalance: {
            increment: withdrawal.coinAmount
          }
        }
      });
      console.log(`🔄 Coins returned to user ${withdrawal.userId} for rejected withdrawal ${withdrawal.id}`);
    }

    // If completed, add transaction ID (simulate manual transfer)
    if (status === 'completed') {
      const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await prisma.withdrawal.update({
        where: { id: id },
        data: {
          transactionId: transactionId
        }
      });
      console.log(`✅ Withdrawal completed - Transaction ID: ${transactionId}`);
    }

    console.log(`✅ Withdrawal status updated - ID: ${id}, Status: ${status}`);

    res.json({
      id: withdrawal.id,
      status: withdrawal.status,
      message: 'Withdrawal status updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating withdrawal status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createWithdrawal,
  getWithdrawals,
  updateWithdrawalStatus
};
