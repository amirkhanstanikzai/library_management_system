import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  createBook,
  getBooks,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook,
  getMyBorrowedBooks,
  getBookBorrowers,
  getBookById,
  getBooksPublic,
} from '../controllers/bookController.js';
import { protect } from '../middleware/authMiddleware.js';
import { admin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// =======================
// Multer Setup for Local Uploads
// =======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + '-' + Date.now() + path.extname(file.originalname)
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif/;
  const ext = path.extname(file.originalname).toLowerCase();
  allowed.test(ext) ? cb(null, true) : cb(new Error('Only images allowed'));
};

const upload = multer({ storage, fileFilter });

// =======================
// Routes
// =======================

// Public: Get book detail (no login needed)
router.get('/public/:id', getBookById);

// Public: Get all books (no login needed)
router.get('/public', getBooksPublic);

// Get all books (protected, any logged-in user)
router.get('/', protect, getBooks);

// Get books borrowed by logged-in user
router.get('/my/borrowed', protect, getMyBorrowedBooks);

// Admin: view who borrowed a specific book
router.get('/:id/borrowers', protect, admin, getBookBorrowers);

// Admin: create a new book
router.post('/', protect, admin, upload.single('image'), createBook);

// Admin: update book
router.put('/:id', protect, admin, upload.single('image'), updateBook);

// Admin: delete book
router.delete('/:id', protect, admin, deleteBook);

// User: borrow book
router.post('/:id/borrow', protect, borrowBook);

// User/Admin: return book
// Users send { userId: their own ID } for return request
// Admins send { userId, adminConfirm: true } to confirm return
router.post('/:id/return', protect, returnBook);

// Get single book
router.get('/:id', protect, getBookById);

export default router;
