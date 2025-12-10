import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import path from 'path';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/library/auth', authRoutes); //Authentication routes for users
app.use('/library/books', bookRoutes); // Book routes

// Serve uploaded images
app.use('/uploads', express.static(path.join(path.resolve(), 'uploads')));

// Test route
app.get('/', (req, res) => {
  res.send('Library system backend running...');
});

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed connnection to MongoDB', err);
    process.exit(1);
  });
