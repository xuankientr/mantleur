const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Bắt đầu seed database...');

  // Tạo users mẫu
  const users = [
    {
      username: 'admin',
      email: 'admin@mantleur.com',
      password: await bcrypt.hash('123456', 12),
      coinBalance: 5000,
      avatar: 'https://ui-avatars.com/api/?name=Admin&background=3b82f6&color=fff'
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

  // Xóa dữ liệu cũ
  await prisma.donation.deleteMany();
  await prisma.stream.deleteMany();
  await prisma.user.deleteMany();

  // Tạo users
  const createdUsers = [];
  for (const userData of users) {
    const user = await prisma.user.create({
      data: userData
    });
    createdUsers.push(user);
    console.log(`✅ Tạo user: ${user.username} (${user.email})`);
  }

  // Tạo streams mẫu
  const streams = [
    {
      title: 'Gaming Stream - PUBG Mobile',
      description: 'Chơi PUBG Mobile cùng viewers, tương tác chat và donate',
      category: 'Gaming',
      isLive: true,
      viewerCount: 150,
      streamKey: 'stream_gaming_001',
      streamerId: createdUsers[1].id // streamer1
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
      streamerId: createdUsers[1].id // streamer1
    },
    {
      title: 'Cooking Stream - Nấu ăn cùng nhau',
      description: 'Hướng dẫn nấu các món ăn ngon',
      category: 'Entertainment',
      isLive: true,
      viewerCount: 67,
      streamKey: 'stream_cooking_001',
      streamerId: createdUsers[0].id // admin
    }
  ];

  const createdStreams = [];
  for (const streamData of streams) {
    const stream = await prisma.stream.create({
      data: streamData
    });
    createdStreams.push(stream);
    console.log(`✅ Tạo stream: ${stream.title}`);
  }

  // Tạo donations mẫu
  const donations = [
    {
      amount: 100,
      message: 'Stream hay quá!',
      donorId: createdUsers[2].id, // viewer1
      streamId: createdStreams[0].id,
      streamerId: createdStreams[0].streamerId
    },
    {
      amount: 50,
      message: 'Keep it up!',
      donorId: createdUsers[3].id, // testuser
      streamId: createdStreams[1].id,
      streamerId: createdStreams[1].streamerId
    },
    {
      amount: 200,
      message: 'Amazing music!',
      donorId: createdUsers[2].id, // viewer1
      streamId: createdStreams[1].id,
      streamerId: createdStreams[1].streamerId
    }
  ];

  for (const donationData of donations) {
    await prisma.donation.create({
      data: donationData
    });
    console.log(`✅ Tạo donation: ${donationData.amount} coin`);
  }

  console.log('\n🎉 Seed database hoàn thành!');
  console.log('\n📋 Thông tin đăng nhập:');
  console.log('┌─────────────────┬─────────────────────┬──────────┐');
  console.log('│ Username        │ Email               │ Password │');
  console.log('├─────────────────┼─────────────────────┼──────────┤');
  console.log('│ admin           │ admin@mantleur.com  │ 123456   │');
  console.log('│ streamer1       │ streamer1@mantleur.com │ 123456 │');
  console.log('│ viewer1         │ viewer1@mantleur.com │ 123456  │');
  console.log('│ testuser        │ test@mantleur.com   │ 123456   │');
  console.log('└─────────────────┴─────────────────────┴──────────┘');
  
  console.log('\n💰 Coin balance:');
  console.log('- admin: 5000 coin');
  console.log('- streamer1: 2000 coin');
  console.log('- viewer1: 1500 coin');
  console.log('- testuser: 1000 coin');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi seed database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



