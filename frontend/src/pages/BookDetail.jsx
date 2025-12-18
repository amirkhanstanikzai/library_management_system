import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import socket from '../socket'; // ✅ import socket instance

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  const isLoggedIn = () => !!localStorage.getItem('token');

  const fetchBook = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/library/books/public/${id}`
      );
      setBook(res.data);
    } catch (error) {
      console.error('Failed to load book:', error);
      setMessage({ text: 'Failed to load book details.', type: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBook();
  }, [id]);

  // ✅ Socket.IO updates
  useEffect(() => {
    const handleBookBorrowed = (update) => {
      if (update.bookId === id) {
        setBook(
          (prev) => prev && { ...prev, borrowedCopies: update.borrowedCopies }
        );
      }
    };

    const handleBookReturned = (update) => {
      if (update.bookId === id) {
        setBook(
          (prev) => prev && { ...prev, borrowedCopies: update.borrowedCopies }
        );
      }
    };

    socket.on('bookBorrowed', handleBookBorrowed);
    socket.on('bookReturned', handleBookReturned);

    return () => {
      socket.off('bookBorrowed', handleBookBorrowed);
      socket.off('bookReturned', handleBookReturned);
    };
  }, [id]);

  const borrowBook = async () => {
    if (!isLoggedIn()) return navigate('/login');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/library/books/${id}/borrow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ text: 'Book borrowed successfully!', type: 'success' });
      // no need to fetchBook() anymore, Socket.IO will update automatically
    } catch (error) {
      console.error(error);
      setMessage({
        text: error.response?.data?.message || 'Borrowing failed.',
        type: 'error',
      });
    }
  };

  const returnBook = async () => {
    if (!isLoggedIn()) return navigate('/login');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/library/books/${id}/return`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ text: 'Book returned successfully!', type: 'success' });
      // no need to fetchBook() anymore, Socket.IO will update automatically
    } catch (error) {
      console.error(error);
      setMessage({
        text: error.response?.data?.message || 'Returning failed.',
        type: 'error',
      });
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center text-xl">
        Loading book details...
      </div>
    );

  if (!book)
    return (
      <div className="min-h-screen flex justify-center items-center text-xl">
        Book not found.
      </div>
    );

  const availableCopies = book.totalCopies - book.borrowedCopies;

  return (
    <div className="min-h-screen bg-base-200 p-6 flex justify-center">
      <div className="max-w-4xl bg-base-100 p-8 rounded-lg shadow-xl w-full">
        <button className="btn btn-outline mb-4" onClick={() => navigate(-1)}>
          ← Back
        </button>

        {message.text && (
          <div
            className={`p-3 mb-4 rounded ${
              message.type === 'success'
                ? 'bg-green-200 text-green-800'
                : 'bg-red-200 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3">
            <img
              src={
                book.image
                  ? `http://localhost:5000/${book.image}`
                  : '/no-image.png'
              }
              alt={book.title}
              className="rounded-lg shadow-md object-cover w-full h-80"
            />
          </div>

          <div className="w-full md:w-2/3 flex flex-col gap-4">
            <h1 className="text-4xl font-bold">{book.title}</h1>
            <h3 className="text-xl opacity-70">by {book.author}</h3>

            <p>
              <strong>Genre:</strong> {book.genre || 'N/A'}
            </p>
            <p>
              <strong>Description:</strong>{' '}
              {book.description || 'No description available.'}
            </p>
            <p>
              <strong>Total Copies:</strong> {book.totalCopies}
            </p>
            <p>
              <strong>Borrowed:</strong> {book.borrowedCopies}
            </p>
            <p>
              <strong>Available:</strong>{' '}
              {availableCopies > 0 ? availableCopies : 'Out of stock'}
            </p>

            {isLoggedIn() ? (
              <div className="flex gap-4 mt-4">
                <button
                  className="btn btn-primary"
                  disabled={availableCopies <= 0}
                  onClick={borrowBook}
                >
                  Borrow
                </button>

                <button
                  className="btn btn-accent"
                  onClick={returnBook}
                  disabled={book.borrowedCopies <= 0}
                >
                  Return
                </button>
              </div>
            ) : (
              <button
                className="btn btn-primary mt-4"
                onClick={() => navigate('/login')}
              >
                Login to Borrow
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
