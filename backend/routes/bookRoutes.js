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

// Get all books
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

// User: return book
router.post('/:id/return', protect, returnBook);

export default router;
