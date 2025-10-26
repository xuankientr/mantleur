const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// SQLite client (for reading)
const sqlitePrisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./prisma/dev.db"
    }
  }
});

// PostgreSQL client (for writing)
const postgresPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function migrateToPostgres() {
  try {
    console.log('🚀 Starting migration from SQLite to PostgreSQL...');

    // 1. Migrate Users
    console.log('📊 Migrating users...');
    const users = await sqlitePrisma.user.findMany();
    for (const user of users) {
      await postgresPrisma.user.upsert({
        where: { email: user.email },
        update: {
          username: user.username,
          password: user.password,
          avatar: user.avatar,
          coinBalance: user.coinBalance
        },
        create: {
          id: user.id,
          username: user.username,
          email: user.email,
          password: user.password,
          avatar: user.avatar,
          coinBalance: user.coinBalance,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    }
    console.log(`✅ Migrated ${users.length} users`);

    // 2. Migrate Streams
    console.log('📊 Migrating streams...');
    const streams = await sqlitePrisma.stream.findMany();
    for (const stream of streams) {
      await postgresPrisma.stream.upsert({
        where: { id: stream.id },
        update: {
          title: stream.title,
          description: stream.description,
          category: stream.category,
          isLive: stream.isLive,
          viewerCount: stream.viewerCount,
          thumbnail: stream.thumbnail,
          streamKey: stream.streamKey,
          streamerId: stream.streamerId
        },
        create: {
          id: stream.id,
          title: stream.title,
          description: stream.description,
          category: stream.category,
          isLive: stream.isLive,
          viewerCount: stream.viewerCount,
          thumbnail: stream.thumbnail,
          streamKey: stream.streamKey,
          streamerId: stream.streamerId,
          createdAt: stream.createdAt,
          updatedAt: stream.updatedAt
        }
      });
    }
    console.log(`✅ Migrated ${streams.length} streams`);

    // 3. Migrate Donations
    console.log('📊 Migrating donations...');
    const donations = await sqlitePrisma.donation.findMany();
    for (const donation of donations) {
      await postgresPrisma.donation.upsert({
        where: { id: donation.id },
        update: {
          amount: donation.amount,
          message: donation.message,
          donorId: donation.donorId,
          streamId: donation.streamId,
          streamerId: donation.streamerId
        },
        create: {
          id: donation.id,
          amount: donation.amount,
          message: donation.message,
          donorId: donation.donorId,
          streamId: donation.streamId,
          streamerId: donation.streamerId,
          createdAt: donation.createdAt
        }
      });
    }
    console.log(`✅ Migrated ${donations.length} donations`);

    // 4. Migrate Withdrawals
    console.log('📊 Migrating withdrawals...');
    const withdrawals = await sqlitePrisma.withdrawal.findMany();
    for (const withdrawal of withdrawals) {
      await postgresPrisma.withdrawal.upsert({
        where: { id: withdrawal.id },
        update: {
          amount: withdrawal.amount,
          coinAmount: withdrawal.coinAmount,
          method: withdrawal.method,
          status: withdrawal.status,
          bankAccount: withdrawal.bankAccount,
          bankName: withdrawal.bankName,
          accountName: withdrawal.accountName,
          phoneNumber: withdrawal.phoneNumber,
          transactionId: withdrawal.transactionId,
          adminNote: withdrawal.adminNote,
          processedAt: withdrawal.processedAt,
          userId: withdrawal.userId
        },
        create: {
          id: withdrawal.id,
          amount: withdrawal.amount,
          coinAmount: withdrawal.coinAmount,
          method: withdrawal.method,
          status: withdrawal.status,
          bankAccount: withdrawal.bankAccount,
          bankName: withdrawal.bankName,
          accountName: withdrawal.accountName,
          phoneNumber: withdrawal.phoneNumber,
          transactionId: withdrawal.transactionId,
          adminNote: withdrawal.adminNote,
          processedAt: withdrawal.processedAt,
          userId: withdrawal.userId,
          createdAt: withdrawal.createdAt,
          updatedAt: withdrawal.updatedAt
        }
      });
    }
    console.log(`✅ Migrated ${withdrawals.length} withdrawals`);

    // 5. Migrate Transactions
    console.log('📊 Migrating transactions...');
    const transactions = await sqlitePrisma.transaction.findMany();
    for (const transaction of transactions) {
      await postgresPrisma.transaction.upsert({
        where: { id: transaction.id },
        update: {
          type: transaction.type,
          amount: transaction.amount,
          status: transaction.status,
          txnId: transaction.txnId,
          userId: transaction.userId
        },
        create: {
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amount,
          status: transaction.status,
          txnId: transaction.txnId,
          userId: transaction.userId,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt
        }
      });
    }
    console.log(`✅ Migrated ${transactions.length} transactions`);

    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sqlitePrisma.$disconnect();
    await postgresPrisma.$disconnect();
  }
}

migrateToPostgres();
