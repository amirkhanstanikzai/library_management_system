import Book from '../models/Book.js';
import fs from 'fs';

// CREATE BOOK (Admin Only)
export const createBook = async (req, res) => {
  try {
    const { title, author, description, totalCopies, category } = req.body;

    if (!title || !author) {
      return res.status(400).json({ message: 'Title and author are required' });
    }

    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }

    let imagePath = '';
    if (req.file) {
      imagePath = req.file.path;
    }

    const book = await Book.create({
      title,
      author,
      description,
      totalCopies: totalCopies || 1,
      category,
      image: imagePath,
    });

    res.status(201).json({ message: 'Book created', book });
  } catch (error) {
    console.error('Create Book Error:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
};

// GET ALL BOOKS (Any logged-in user)
export const getBooks = async (req, res) => {
  try {
    const books = await Book.find().populate('borrowers.user', 'name email');
    res.json(books);
  } catch (error) {
    console.error('Get Books Error:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
};

// GET BOOKS BORROWED BY LOGGED-IN USER
export const getMyBorrowedBooks = async (req, res) => {
  try {
    const books = await Book.find({ 'borrowers.user': req.user._id }).populate(
      'borrowers.user',
      'name email'
    );

    const userBooks = books.map((book) => {
      const borrower = book.borrowers.find(
        (b) => b.user._id.toString() === req.user._id.toString()
      );

      return {
        _id: book._id,
        title: book.title,
        author: book.author,
        description: book.description,
        image: book.image,
        totalCopies: book.totalCopies,
        borrowedCopies: book.borrowedCopies,
        borrower,
      };
    });

    res.json(userBooks);
  } catch (error) {
    console.error('Get My Borrowed Books Error:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
};

// GET ALL BORROWERS FOR A BOOK (ADMIN)
export const getBookBorrowers = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate(
      'borrowers.user',
      'name email'
    );

    if (!book) return res.status(404).json({ message: 'Book not found' });

    res.json({ borrowers: book.borrowers });
  } catch (error) {
    console.error('Get Borrowers Error:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
};

// UPDATE BOOK (Admin Only)
export const updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const { title, author, description, totalCopies, category } = req.body;

    if (title) book.title = title;
    if (author) book.author = author;
    if (description) book.description = description;
    if (totalCopies) book.totalCopies = totalCopies;
    if (category) book.category = category;

    if (req.file) {
      if (book.image && fs.existsSync(book.image)) fs.unlinkSync(book.image);
      book.image = req.file.path;
    }

    await book.save();
    res.json({ message: 'Book updated', book });
  } catch (error) {
    console.error('Update Book Error:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
};

// DELETE BOOK (Admin Only)
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) return res.status(404).json({ message: 'Book not found' });

    if (book.image && fs.existsSync(book.image)) fs.unlinkSync(book.image);

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete Book Error:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
};

// BORROW BOOK (User) ✅ SOCKET EVENT ADDED
export const borrowBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    if (book.borrowedCopies >= book.totalCopies)
      return res.status(400).json({ message: 'No copies available' });

    const alreadyBorrowed = book.borrowers.some(
      (b) => b.user.toString() === req.user._id.toString()
    );
    if (alreadyBorrowed)
      return res
        .status(400)
        .json({ message: 'You already borrowed this book' });

    book.borrowedCopies++;
    book.borrowers.push({ user: req.user._id });

    await book.save();

    // 🔔 WebSocket emit
    req.app.get('io')?.emit('bookBorrowed', {
      bookId: book._id,
      userId: req.user._id,
      borrowedCopies: book.borrowedCopies,
    });

    res.json({ message: 'Book borrowed successfully', book });
  } catch (error) {
    console.error('Borrow Book Error:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
};

// RETURN BOOK (User + Admin) ✅ SOCKET EVENTS ADDED
export const returnBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const { userId, adminConfirm } = req.body;
    const targetUserId = userId || req.user._id.toString();

    const borrowerIndex = book.borrowers.findIndex(
      (b) => b.user.toString() === targetUserId
    );

    if (borrowerIndex === -1)
      return res
        .status(400)
        .json({ message: 'This user has not borrowed this book' });

    const borrower = book.borrowers[borrowerIndex];

    if (adminConfirm) {
      borrower.returnedAt = new Date();
      book.borrowedCopies = Math.max(0, book.borrowedCopies - 1);
      book.borrowers.splice(borrowerIndex, 1);

      await book.save();

      // 🔔 WebSocket emit (confirmed return)
      req.app.get('io')?.emit('bookReturned', {
        bookId: book._id,
        userId: targetUserId,
        borrowedCopies: book.borrowedCopies,
      });

      return res.json({ message: 'Return confirmed by admin', book });
    } else {
      borrower.returnRequested = true;
      await book.save();

      // 🔔 WebSocket emit (return requested)
      req.app.get('io')?.emit('bookReturnRequested', {
        bookId: book._id,
        userId: targetUserId,
      });

      return res.json({
        message: 'Return requested. Admin must approve.',
        book,
      });
    }
  } catch (error) {
    console.error('Return Book Error:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
};

// GET single book by ID
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    res.json(book);
  } catch (error) {
    console.error('Get Book By ID Error:', error);
    res.status(500).json({ message: 'Internal Server Error' + error.message });
  }
};

// GET books (public)
export const getBooksPublic = async (req, res) => {
  try {
    const books = await Book.find({});
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load books' + error.message });
  }
};

// GET DISTINCT CATEGORIES
export const getCategories = async (req, res) => {
  try {
    const categories = await Book.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Get Categories Error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
};
