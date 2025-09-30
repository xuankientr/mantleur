const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const streamRoutes = require('./routes/stream');
const donationRoutes = require('./routes/donation');

const app = express();
const server = createServer(app);

// Allow multiple CORS origins (comma-separated)
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173").split(',').map(o => o.trim());

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/streams', streamRoutes);
app.use('/api/donations', donationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join stream room
  socket.on('join-stream', (streamId) => {
    socket.join(`stream-${streamId}`);
    console.log(`User ${socket.id} joined stream ${streamId}`);
  });

  // Leave stream room
  socket.on('leave-stream', (streamId) => {
    socket.leave(`stream-${streamId}`);
    console.log(`User ${socket.id} left stream ${streamId}`);
  });

  // Chat message
  socket.on('chat-message', (data) => {
    const { streamId, message, username } = data;
    socket.to(`stream-${streamId}`).emit('chat-message', {
      id: Date.now(),
      message,
      username,
      timestamp: new Date().toISOString()
    });
  });

  // WebRTC signaling
  socket.on('webrtc-offer', (data) => {
    socket.to(`stream-${data.streamId}`).emit('webrtc-offer', data);
  });

  socket.on('webrtc-answer', (data) => {
    socket.to(`stream-${data.streamId}`).emit('webrtc-answer', data);
  });

  socket.on('webrtc-ice-candidate', (data) => {
    socket.to(`stream-${data.streamId}`).emit('webrtc-ice-candidate', data);
  });

  // Viewer count update
  socket.on('update-viewer-count', (data) => {
    const { streamId, count } = data;
    socket.to(`stream-${streamId}`).emit('viewer-count-update', { count });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io server ready`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, io };


