import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminBorrowedBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchBooks();
  }, []);

  // Fetch all books
  const fetchBooks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/library/books', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBooks(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert('Failed to load books');
    }
  };

  const fetchBorrowers = async (bookId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/library/books/${bookId}/borrowers`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return res.data.borrowers;
    } catch (err) {
      console.error(err);
      alert('Failed to load borrowers');
    }
  };

  const toggleBorrowers = async (index, bookId) => {
    const newBooks = [...books];

    if (!newBooks[index].borrowersLoaded) {
      const borrowers = await fetchBorrowers(bookId);
      newBooks[index].borrowers = borrowers;
      newBooks[index].borrowersLoaded = true;
    }

    newBooks[index].showBorrowers = !newBooks[index].showBorrowers;
    setBooks(newBooks);
  };

  if (loading)
    return (
      <div className="p-6 sm:p-8 text-lg sm:text-xl">
        Loading borrowed books...
      </div>
    );

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-center sm:text-left">
        📚 Borrowed Books (Admin)
      </h1>

      <div className="space-y-4 sm:space-y-5">
        {books.map((book, index) => (
          <div key={book._id} className="card bg-base-100 shadow-xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold">
                  {book.title}
                </h2>
                <p className="text-sm opacity-70">{book.author}</p>
                <p className="mt-1 text-sm sm:text-base">
                  Borrowed:{' '}
                  <span className="font-semibold">{book.borrowedCopies}</span> /{' '}
                  {book.totalCopies}
                </p>
              </div>

              <button
                className="btn btn-outline btn-primary w-full sm:w-auto"
                onClick={() => toggleBorrowers(index, book._id)}
              >
                {book.showBorrowers ? 'Hide Borrowers' : 'View Borrowers'}
              </button>
            </div>

            {/* Borrowers List */}
            {book.showBorrowers && (
              <div className="mt-4 p-3 sm:p-4 border rounded-lg bg-base-200 overflow-x-auto">
                {(!book.borrowers || book.borrowers.length === 0) && (
                  <p className="text-sm sm:text-base">
                    No one has borrowed this book.
                  </p>
                )}

                {book.borrowers && book.borrowers.length > 0 && (
                  <table className="table table-zebra w-full text-sm sm:text-base">
                    <thead className="hidden sm:table-header-group">
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Borrowed At</th>
                        <th>Return Requested</th>
                        <th>Returned At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {book.borrowers.map((b, i) => (
                        <tr key={i} className="sm:table-row block sm:contents">
                          <td className="block sm:table-cell">
                            <span className="font-semibold sm:hidden">
                              User:{' '}
                            </span>
                            {b.user?.name}
                          </td>
                          <td className="block sm:table-cell">
                            <span className="font-semibold sm:hidden">
                              Email:{' '}
                            </span>
                            {b.user?.email}
                          </td>
                          <td className="block sm:table-cell">
                            <span className="font-semibold sm:hidden">
                              Borrowed At:{' '}
                            </span>
                            {new Date(b.borrowedAt).toLocaleDateString()}
                          </td>
                          <td className="block sm:table-cell">
                            <span className="font-semibold sm:hidden">
                              Return Requested:{' '}
                            </span>
                            {b.returnRequested ? '✅' : '❌'}
                          </td>
                          <td className="block sm:table-cell">
                            <span className="font-semibold sm:hidden">
                              Returned At:{' '}
                            </span>
                            {b.returnedAt
                              ? new Date(b.returnedAt).toLocaleDateString()
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
