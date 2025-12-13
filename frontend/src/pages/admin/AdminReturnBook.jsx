import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminReturnBook() {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/library/books', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(res.data);
      setLoading(false);
    } catch (err) {
      setMessage('❌ Failed to load books');
    }
  };

  const loadBorrowers = async (bookId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/library/books/${bookId}/borrowers`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBorrowers(res.data.borrowers);
      setSelectedBook(bookId);
      setMessage('');
    } catch (err) {
      setMessage('❌ Failed to load borrowers');
    }
  };

  const confirmReturn = async (userId) => {
    try {
      await axios.post(
        `http://localhost:5000/library/books/${selectedBook}/return`,
        { userId, adminConfirm: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage('✅ Book return confirmed successfully!');
      loadBorrowers(selectedBook);
      loadBooks();
    } catch (err) {
      setMessage('❌ Failed to confirm return');
    }
  };

  if (loading)
    return (
      <div className="p-6 sm:p-8 text-lg sm:text-xl">
        Loading borrowed books...
      </div>
    );

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-5 text-center sm:text-left">
        ↩️ Return Borrowed Books
      </h1>

      {message && (
        <div className="mb-4 p-3 rounded bg-yellow-100 text-yellow-800 text-sm sm:text-base">
          {message}
        </div>
      )}

      {/* Book selector */}
      <div className="mb-6 flex justify-center sm:justify-start">
        <select
          className="select select-primary w-full sm:max-w-md"
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
        <div className="card bg-base-200 p-4 sm:p-5 shadow-lg">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-4">
            Borrowers List
          </h2>

          {borrowers.length === 0 && (
            <p className="opacity-70 text-sm sm:text-base">
              No borrowers found for this book.
            </p>
          )}

          {borrowers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full text-sm sm:text-base">
                <thead className="hidden sm:table-header-group">
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
                    <tr
                      key={i}
                      className="block sm:table-row border-b sm:border-none"
                    >
                      <td className="block sm:table-cell">
                        <span className="sm:hidden font-semibold">User: </span>
                        {b.user?.name}
                      </td>
                      <td className="block sm:table-cell">
                        <span className="sm:hidden font-semibold">Email: </span>
                        {b.user?.email}
                      </td>
                      <td className="block sm:table-cell">
                        <span className="sm:hidden font-semibold">
                          Borrowed At:{' '}
                        </span>
                        {new Date(b.borrowedAt).toLocaleDateString()}
                      </td>
                      <td className="block sm:table-cell">
                        <span className="sm:hidden font-semibold">
                          Return Requested:{' '}
                        </span>
                        {b.returnRequested ? '✅' : '❌'}
                      </td>
                      <td className="block sm:table-cell">
                        <span className="sm:hidden font-semibold">
                          Returned At:{' '}
                        </span>
                        {b.returnedAt
                          ? new Date(b.returnedAt).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="block sm:table-cell py-2">
                        {!b.returnedAt && (
                          <button
                            className="btn btn-xs sm:btn-sm btn-success w-full sm:w-auto"
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
