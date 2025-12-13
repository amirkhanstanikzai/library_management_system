import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminReturnBook() {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(''); // for inline messages

  const token = localStorage.getItem('token');

  useEffect(() => {
    loadBooks();
  }, []);

  // Load all books
  const loadBooks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/library/books', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to load books');
    }
  };

  // Load borrowers of selected book
  const loadBorrowers = async (bookId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/library/books/${bookId}/borrowers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBorrowers(res.data.borrowers);
      setSelectedBook(bookId);
      setMessage('');
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to load borrowers');
    }
  };

  // Admin confirms book return
  const confirmReturn = async (userId) => {
    try {
      await axios.post(
        `http://localhost:5000/library/books/${selectedBook}/return`,
        { userId, adminConfirm: true },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage('✅ Book return confirmed successfully!');

      // Refresh data
      loadBorrowers(selectedBook);
      loadBooks();
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to confirm return');
    }
  };

  if (loading)
    return <div className="p-8 text-xl">Loading borrowed books...</div>;

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-5">↩️ Return Borrowed Books</h1>

      {message && (
        <div className="mb-4 p-3 rounded bg-yellow-100 text-yellow-800">
          {message}
        </div>
      )}

      {/* Book selector */}
      <div className="mb-6">
        <select
          className="select select-primary w-full max-w-md"
          onChange={(e) => loadBorrowers(e.target.value)}
        >
          <option value="">Select a Book</option>
          {books
            .filter((b) => b.borrowedCopies > 0)
            .map((book) => (
              <option key={book._id} value={book._id}>
                {book.title} ({book.borrowedCopies} borrowed)
              </option>
            ))}
        </select>
      </div>

      {/* Borrowers list */}
      {selectedBook && (
        <div className="card bg-base-200 p-5 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Borrowers List</h2>

          {borrowers.length === 0 && (
            <p className="opacity-70">No borrowers found for this book.</p>
          )}

          {borrowers.length > 0 && (
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Borrowed At</th>
                  <th>Return Requested</th>
                  <th>Returned At</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {borrowers.map((b, i) => (
                  <tr key={i}>
                    <td>{b.user?.name}</td>
                    <td>{b.user?.email}</td>
                    <td>{new Date(b.borrowedAt).toLocaleDateString()}</td>
                    <td>{b.returnRequested ? '✅' : '❌'}</td>
                    <td>
                      {b.returnedAt
                        ? new Date(b.returnedAt).toLocaleDateString()
                        : '-'}
                    </td>
                    <td>
                      {!b.returnedAt && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => confirmReturn(b.user._id)}
                        >
                          Confirm Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
