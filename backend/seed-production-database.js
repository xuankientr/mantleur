const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Use production PostgreSQL database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://mantleur_db_user_new:xFKUpcvVgHPmijojA7vKUZVyNSt34vJz@dpg-d3v1hc7diees73el0jjg-a/mantleur_db_new"
    }
  }
});

async function seedProductionDatabase() {
  console.log('🌱 Seeding production PostgreSQL database...');
  
  try {
    // Create all users including admin
    const users = [
      {
        username: 'admin',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 12),
        coinBalance: 10000,
        avatar: 'https://ui-avatars.com/api/?name=Admin&background=3b82f6&color=fff'
      },
      {
        username: 'testuser_admin',
        email: 'testuser@gmail.com',
        password: await bcrypt.hash('123456', 12),
        coinBalance: 5000,
        avatar: 'https://ui-avatars.com/api/?name=TestUser&background=10b981&color=fff'
      },
      {
        username: 'mantleur_admin',
        email: 'admin@mantleur.com',
        password: await bcrypt.hash('123456', 12),
        coinBalance: 8000,
        avatar: 'https://ui-avatars.com/api/?name=MantleurAdmin&background=ef4444&color=fff'
      },
      {
        username: 'streamer1',
        email: 'streamer1@mantleur.com',
        password: await bcrypt.hash('123456', 12),
        coinBalance: 2000,
        avatar: 'https://ui-avatars.com/api/?name=Streamer1&background=10b981&color=fff'
      },
      {
        username: 'viewer1',
        email: 'viewer1@mantleur.com',
        password: await bcrypt.hash('123456', 12),
        coinBalance: 1500,
        avatar: 'https://ui-avatars.com/api/?name=Viewer1&background=f59e0b&color=fff'
      },
      {
        username: 'testuser',
        email: 'test@mantleur.com',
        password: await bcrypt.hash('123456', 12),
        coinBalance: 1000,
        avatar: 'https://ui-avatars.com/api/?name=Test&background=ef4444&color=fff'
      }
    ];

    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await prisma.donation.deleteMany();
    await prisma.stream.deleteMany();
    await prisma.user.deleteMany();

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    for (const userData of users) {
      try {
        const user = await prisma.user.create({
          data: userData
        });
        createdUsers.push(user);
        console.log(`✅ Created user: ${user.username} (${user.email})`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️ User ${userData.email} already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }

    // Create sample streams
    console.log('📺 Creating sample streams...');
    const streams = [
      {
        title: 'Gaming Stream - PUBG Mobile',
        description: 'Chơi PUBG Mobile cùng viewers, tương tác chat và donate',
        category: 'Gaming',
        isLive: true,
        viewerCount: 150,
        streamKey: 'stream_gaming_001',
        streamerId: createdUsers[3]?.id || createdUsers[0].id // streamer1 or admin
      },
      {
        title: 'Music Stream - Piano Cover',
        description: 'Cover các bài hát nổi tiếng trên piano',
        category: 'Music',
        isLive: true,
        viewerCount: 89,
        streamKey: 'stream_music_001',
        streamerId: createdUsers[0].id // admin
      },
      {
        title: 'Talk Show - Chia sẻ kinh nghiệm',
        description: 'Chia sẻ kinh nghiệm lập trình và phát triển web',
        category: 'Education',
        isLive: false,
        viewerCount: 0,
        streamKey: 'stream_talk_001',
        streamerId: createdUsers[3]?.id || createdUsers[0].id // streamer1 or admin
      }
    ];

    const createdStreams = [];
    for (const streamData of streams) {
      const stream = await prisma.stream.create({
        data: streamData
      });
      createdStreams.push(stream);
      console.log(`✅ Created stream: ${stream.title}`);
    }

    // Create sample donations
    console.log('💰 Creating sample donations...');
    const donations = [
      {
        amount: 100,
        message: 'Stream hay quá!',
        donorId: createdUsers[4]?.id || createdUsers[0].id, // viewer1 or admin
        streamId: createdStreams[0].id,
        streamerId: createdStreams[0].streamerId
      },
      {
        amount: 50,
        message: 'Keep it up!',
        donorId: createdUsers[5]?.id || createdUsers[0].id, // testuser or admin
        streamId: createdStreams[1].id,
        streamerId: createdStreams[1].streamerId
      },
      {
        amount: 200,
        message: 'Amazing music!',
        donorId: createdUsers[4]?.id || createdUsers[0].id, // viewer1 or admin
        streamId: createdStreams[1].id,
        streamerId: createdStreams[1].streamerId
      }
    ];

    for (const donationData of donations) {
      await prisma.donation.create({
        data: donationData
      });
      console.log(`✅ Created donation: ${donationData.amount} coin`);
    }

    console.log('\n🎉 Production database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('┌─────────────────────┬──────────┬─────────────────┐');
    console.log('│ Email               │ Password │ Purpose         │');
    console.log('├─────────────────────┼──────────┼─────────────────┤');
    console.log('│ admin@example.com   │ admin123 │ Main admin      │');
    console.log('│ testuser@gmail.com  │ 123456   │ Test admin      │');
    console.log('│ admin@mantleur.com  │ 123456   │ Backup admin    │');
    console.log('│ streamer1@mantleur.com │ 123456 │ Streamer       │');
    console.log('│ viewer1@mantleur.com  │ 123456 │ Viewer         │');
    console.log('│ test@mantleur.com   │ 123456   │ Test user      │');
    console.log('└─────────────────────┴──────────┴─────────────────┘');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedProductionDatabase();
