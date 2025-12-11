import express from 'express';
import { register, verifyEmail, login } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';
import { createBook, getBooks } from '../controllers/bookController.js';

const router = express.Router();

// ===============================
// AUTH ROUTES
// ===============================

// Register
router.post('/register', register);

// Verify Email
router.post('/verify-email', verifyEmail);

// Login
router.post('/login', login);

export default router;
