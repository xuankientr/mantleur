require('dotenv').config({ path: './env.local' });
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const prisma = require('./models/database');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/streams', require('./routes/stream'));
app.use('/api/users', require('./routes/user'));
app.use('/api/donations', require('./routes/donation'));
app.use('/api/follows', require('./routes/follow'));
app.use('/api/payments', require('./routes/payment'));
app.use('/api/withdrawals', require('./routes/withdrawal'));
app.use('/api/scheduled-streams', require('./routes/scheduledStream'));

// Debounce viewer count updates
const viewerCountDebounce = new Map();

// Helper function to update viewer count
const updateViewerCount = async (io, streamId) => {
  // Clear existing timeout for this stream
  if (viewerCountDebounce.has(streamId)) {
    clearTimeout(viewerCountDebounce.get(streamId));
  }
  
  // Set new timeout
  const timeoutId = setTimeout(async () => {
    try {
      // Check if stream exists first
      const stream = await prisma.stream.findUnique({
        where: { id: streamId }
      });

      if (!stream) {
        console.log(`Stream ${streamId} not found, skipping viewer count update`);
        return;
      }

      // Get current viewer count from socket rooms (excluding streamer)
      const room = io.sockets.adapter.rooms.get(`stream-${streamId}`);
      let viewerCount = 0;
      
      if (room) {
        const socketsInRoom = Array.from(room);
        viewerCount = socketsInRoom.length;
      }
      
      // Update database
      await prisma.stream.update({
        where: { id: streamId },
        data: { viewerCount }
      });

      // Broadcast to all viewers in the stream
      io.to(`stream-${streamId}`).emit('viewer-count-update', { streamId, count: viewerCount });

      console.log(`Stream ${streamId} viewer count updated to ${viewerCount}`);
    } catch (error) {
      console.error('Error updating viewer count:', error);
    } finally {
      viewerCountDebounce.delete(streamId);
    }
  }, 1000); // 1 second debounce
  
  viewerCountDebounce.set(streamId, timeoutId);
};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Register user for notifications
  socket.on('register-user', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} registered for notifications`);
  });

  // Join stream room
  socket.on('join-stream', async (data) => {
    const { streamId, isStreamer = false } = typeof data === 'string' ? { streamId: data } : data;
    
    if (isStreamer) {
      socket.join(`streamer-${streamId}`);
      socket.join(`stream-${streamId}`); // Streamer also joins stream room for marquee updates
      console.log(`Streamer ${socket.id} joined stream ${streamId} (both rooms)`);
    } else {
      socket.join(`stream-${streamId}`);
      console.log(`Viewer ${socket.id} joined stream ${streamId}`);
    }

    try {
      await updateViewerCount(io, streamId);
    } catch (error) {
      console.error('Error updating viewer count on join:', error);
    }
  });

  // Leave stream room
  socket.on('leave-stream', async (data) => {
    const { streamId, isStreamer = false } = typeof data === 'string' ? { streamId: data } : data;
    
    if (isStreamer) {
      socket.leave(`streamer-${streamId}`);
      socket.leave(`stream-${streamId}`); // Streamer also leaves stream room
      console.log(`Streamer ${socket.id} left stream ${streamId} (both rooms)`);
    } else {
      socket.leave(`stream-${streamId}`);
      console.log(`Viewer ${socket.id} left stream ${streamId}`);
    }

    try {
      await updateViewerCount(io, streamId);
    } catch (error) {
      console.error('Error updating viewer count on leave:', error);
    }
  });

  // Chat message
  socket.on('chat-message', (data) => {
    socket.to(`stream-${data.streamId}`).emit('chat-message', data);
  });

  // WebRTC signaling
  socket.on('webrtc-offer', (data) => {
    socket.to(`streamer-${data.streamId}`).emit('webrtc-offer', data);
  });

  socket.on('webrtc-answer', (data) => {
    socket.to(`stream-${data.streamId}`).emit('webrtc-answer', data);
  });

  socket.on('webrtc-ice-candidate', (data) => {
    socket.to(`stream-${data.streamId}`).emit('webrtc-ice-candidate', data);
  });

  // Marquee text update
  socket.on('marquee-update', (data) => {
    const { streamId, text, position } = data;
    console.log('📝 Marquee update received:', { streamId, text, position });
    console.log('📤 Broadcasting to room:', `stream-${streamId}`);
    console.log('📤 Room members:', Array.from(io.sockets.adapter.rooms.get(`stream-${streamId}`) || []));
    socket.to(`stream-${streamId}`).emit('marquee-update', { text, position });
    console.log('📤 Marquee update broadcasted to stream:', streamId);
  });

  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.id);

    try {
      const rooms = Array.from(socket.rooms);
      for (const room of rooms) {
        if (room.startsWith('stream-') || room.startsWith('streamer-')) {
          const streamId = room.replace('stream-', '').replace('streamer-', '');
          await updateViewerCount(io, streamId);
        }
      }
    } catch (error) {
      console.error('Error updating viewer count on disconnect:', error);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});