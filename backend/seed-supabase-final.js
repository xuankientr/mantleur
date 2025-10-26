const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function seedSupabaseDatabase() {
  console.log('🌱 Seeding Supabase database...');
  
  const prisma = new PrismaClient();

  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to Supabase successfully!');
    
    // Check if tables exist
    try {
      const userCount = await prisma.user.count();
      console.log(`📊 Current users: ${userCount}`);
    } catch (error) {
      console.log('⚠️ Tables not created yet, waiting for migration...');
      console.log('💡 Run: npx prisma db push');
      return;
    }
    
    // Create admin users
    const adminUsers = [
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
      }
    ];

    // Create users
    const createdUsers = [];
    for (const userData of adminUsers) {
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
      }
    ];

    for (const streamData of streams) {
      try {
        const stream = await prisma.stream.create({
          data: streamData
        });
        console.log(`✅ Created stream: ${stream.title}`);
      } catch (error) {
        console.log(`⚠️ Stream ${streamData.title} already exists, skipping...`);
      }
    }

    console.log('\n🎉 Supabase database seeded successfully!');
    console.log('\n📋 Admin Login Credentials:');
    console.log('┌─────────────────────┬──────────┬─────────────────┐');
    console.log('│ Email               │ Password │ Purpose         │');
    console.log('├─────────────────────┼──────────┼─────────────────┤');
    console.log('│ admin@example.com   │ admin123 │ Main admin      │');
    console.log('│ testuser@gmail.com  │ 123456   │ Test admin      │');
    console.log('│ admin@mantleur.com  │ 123456   │ Backup admin    │');
    console.log('│ streamer1@mantleur.com │ 123456 │ Streamer       │');
    console.log('│ viewer1@mantleur.com  │ 123456 │ Viewer         │');
    console.log('└─────────────────────┴──────────┴─────────────────┘');
    
  } catch (error) {
    console.error('❌ Error seeding Supabase:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedSupabaseDatabase();
