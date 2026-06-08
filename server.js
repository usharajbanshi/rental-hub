const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
require('express-async-errors');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://192.168.18.2:3000',
      'https://rentalhub-client.vercel.app'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://192.168.18.2:3000',
    'https://rentalhub-client.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => res.json({ message: 'Server is working!' }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/reservations', require('./routes/reservationRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Socket.io
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // User joins with their ID
  socket.on('join', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`👤 User ${userId} is online`);
  });

  // Join conversation room
  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`💬 User joined conversation: ${conversationId}`);
  });

  // Send message
  socket.on('sendMessage', (data) => {
    const { conversationId, message } = data;
    // Broadcast to all in conversation room except sender
    socket.to(conversationId).emit('newMessage', message);
  });

  // Typing indicator
  socket.on('typing', (data) => {
    socket.to(data.conversationId).emit('userTyping', {
      userId: data.userId,
      name: data.name
    });
  });

  socket.on('stopTyping', (data) => {
    socket.to(data.conversationId).emit('userStopTyping');
  });

  socket.on('disconnect', () => {
    onlineUsers.forEach((socketId, userId) => {
      if (socketId === socket.id) onlineUsers.delete(userId);
    });
    console.log('❌ User disconnected:', socket.id);
  });
});

const errorMiddleware = require('./middlewares/errorMiddleware');
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
