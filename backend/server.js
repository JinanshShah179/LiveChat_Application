const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

// Import routes
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/user', userRoutes);
app.use('/api/group', groupRoutes);

// Socket.IO Setup
const io = new Server(server, {
  cors: { origin: '*' },
});

io.on('connection', (socket) => {
  console.log('New WebSocket connection', socket.id);

  // Debugging: Log all socket events
  socket.onAny((event, ...args) => {
    console.log(`Socket Event: ${event}`, args);
  });

  // Join private chat room
  socket.on('joinRoom', (userId) => {
    socket.join(userId);
    console.log(`User with ID ${userId} joined their room`);
  });

  // Join a group chat room
  socket.on('join-group', (groupId) => {
    try {
      if (!groupId) throw new Error('Group ID is required');
      socket.join(groupId);
      console.log(`User joined group ${groupId}`);
    } catch (error) {
      console.error('Error joining group:', error.message);
    }
  });

  // Send private message
  socket.on('sendMessage', (messageData) => {
    const { fromUserId, toUserId, message } = messageData;
    io.to(toUserId).to(fromUserId).emit('newMessage', { fromUserId, toUserId, message });
    console.log('Private message sent:', messageData);
  });


  // Send group message
  socket.on('send-group-message', (messageData) => {
    const { groupId, fromUserId, message,createdAt,fromUserName } = messageData;
    io.to(groupId).emit('receive-group-message', { groupId, fromUserId, message,createdAt,fromUserName});
    console.log('Group message sent:', messageData);
  });

  // Get Group message
  socket.on("receive-group-message", (newMessage) => {
    const messageWithTimestamp = { ...newMessage, createdAt: new Date() }; // Add createdAt here
    console.log("Receive group message");
    setMessages((prevMessages) => [...prevMessages, messageWithTimestamp]);
  });
  
  // Typing and stop typing events
  socket.on('typing', ({ chatId, userId }) => {
    io.to(chatId).emit('typing', { userId });
  });

  socket.on('stopTyping', ({ chatId, userId }) => {
    io.to(chatId).emit('stopTyping', { userId });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
