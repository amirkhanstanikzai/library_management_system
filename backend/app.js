import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import path from 'path';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/library/auth', authRoutes);
app.use('/library/books', bookRoutes);

// Serve uploaded images
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

// Test route
app.get('/', (req, res) => {
  res.send('Library system backend running...');
});

export default app;
