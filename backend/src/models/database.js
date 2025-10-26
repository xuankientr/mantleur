const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Add connection pool settings for better stability
  __internal: {
    engine: {
      connection_limit: 10,
      pool_timeout: 20,
    }
  }
});

// Connection retry logic
let isConnected = false;
const maxRetries = 5;
let retryCount = 0;

async function connectWithRetry() {
  while (retryCount < maxRetries) {
    try {
      await prisma.$connect();
      isConnected = true;
      console.log('✅ Database connected successfully');
      retryCount = 0;
      return true;
    } catch (error) {
      retryCount++;
      console.error(`❌ Database connection failed (attempt ${retryCount}/${maxRetries}):`, error.message);
      
      if (retryCount >= maxRetries) {
        console.error('❌ Max retries reached. Failed to connect to database.');
        throw new Error('Database connection failed after max retries');
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 10000);
      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Initial connection
connectWithRetry().catch(err => {
  console.error('❌ Failed to connect to database:', err);
});

// Handle connection errors
prisma.$on('error', async (e) => {
  console.error('❌ Prisma error:', e);
  isConnected = false;
  
  // Attempt to reconnect
  if (retryCount < maxRetries) {
    console.log('🔄 Attempting to reconnect...');
    setTimeout(() => connectWithRetry(), 5000);
  }
});

// Handle disconnection
prisma.$on('disconnect', () => {
  console.log('⚠️ Database disconnected');
  isConnected = false;
});

// Health check function
async function healthCheck() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    isConnected = true;
    return true;
  } catch (error) {
    isConnected = false;
    console.error('❌ Database health check failed:', error.message);
    
    // Attempt to reconnect
    if (retryCount < maxRetries) {
      await connectWithRetry();
    }
    return false;
  }
}

// Periodic health check (every 5 minutes)
setInterval(async () => {
  await healthCheck();
}, 5 * 60 * 1000);

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('🛑 Graceful shutdown initiated...');
  
  // Stop accepting new connections
  if (isConnected) {
    try {
      await prisma.$disconnect();
      console.log('✅ Database disconnected gracefully');
    } catch (error) {
      console.error('❌ Error during database disconnection:', error);
    }
  }
  
  process.exit(0);
};

// Handle process signals
process.on('SIGTERM', async () => {
  console.log('📨 SIGTERM signal received');
  await gracefulShutdown();
});

process.on('SIGINT', async () => {
  console.log('📨 SIGINT signal received');
  await gracefulShutdown();
});

process.on('beforeExit', async () => {
  console.log('⚠️ beforeExit event');
  await gracefulShutdown();
});

process.on('uncaughtException', async (error) => {
  console.error('❌ Uncaught Exception:', error);
  await gracefulShutdown();
});

module.exports = prisma;
module.exports.isConnected = () => isConnected;
module.exports.healthCheck = healthCheck;
module.exports.connectWithRetry = connectWithRetry;

