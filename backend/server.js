import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import app from './app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server from Express app
const server = http.createServer(app);

// Attach Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*', // you can restrict this later
  },
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Make io available inside controllers
app.set('io', io);

// Connect DB and start server
connectDB()
  .then(() => {
    server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed connection to MongoDB', err);
    process.exit(1);
  });
