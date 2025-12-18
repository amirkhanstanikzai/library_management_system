import { useEffect, useState } from 'react';
import axios from 'axios';

export default function BorrowedBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) loadBorrowedBooks();
  }, [token]);

  const loadBorrowedBooks = async () => {
    try {
      const res = await axios.get(
        'http://localhost:5000/library/books/my/borrowed',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBooks(res.data);
      setMessage(null); // Clear any previous messages
    } catch (err) {
      console.error(err);
      setMessage('Failed to load borrowed books');
    } finally {
      setLoading(false);
    }
  };

  const requestReturn = async (bookId) => {
    try {
      await axios.post(
        `http://localhost:5000/library/books/${bookId}/return`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Return request sent successfully.');
      loadBorrowedBooks();
    } catch (err) {
      console.error(err);
      setMessage('Failed to request return.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-base-100">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center md:text-left">
        📚 My Borrowed Books
      </h1>

      {message && (
        <p className="text-center md:text-left text-sm text-red-600 mb-4">
          {message}
        </p>
      )}

      {books.length === 0 ? (
        <p className="opacity-70 text-center md:text-left">
          You haven't borrowed any books.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <div
              key={book._id}
              className="card bg-base-100 shadow p-4 sm:p-5 flex flex-col"
            >
              <img
                src={
                  book.image
                    ? `http://localhost:5000/${book.image}`
                    : '/profile-cartoon.png'
                }
                className="w-full h-48 sm:h-56 object-cover rounded"
                alt={book.title}
              />

              <h2 className="text-xl sm:text-2xl font-bold mt-3">
                {book.title}
              </h2>
              <p className="opacity-70">{book.author}</p>

              {book.borrower?.borrowedAt && (
                <p className="mt-2 text-sm">
                  Borrowed on:{' '}
                  <strong>
                    {new Date(book.borrower.borrowedAt).toLocaleDateString()}
                  </strong>
                </p>
              )}

              {book.borrower?.returnRequested && (
                <p className="text-yellow-600 text-sm mt-1">Return Requested</p>
              )}

              <button
                className="btn btn-warning mt-4 w-full"
                disabled={book.borrower?.returnRequested}
                onClick={() => requestReturn(book._id)}
              >
                {book.borrower?.returnRequested
                  ? 'Return Requested'
                  : 'Request Return'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
