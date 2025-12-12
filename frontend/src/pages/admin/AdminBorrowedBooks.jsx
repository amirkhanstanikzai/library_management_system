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

      return res.data;
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
    return <div className="p-8 text-xl">Loading borrowed books...</div>;

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-6">📚 Borrowed Books (Admin)</h1>

      <div className="space-y-5">
        {books.map((book, index) => (
          <div key={book._id} className="card bg-base-100 shadow-xl p-5">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">{book.title}</h2>
                <p className="text-sm opacity-70">{book.author}</p>
                <p className="mt-1">
                  Borrowed:{' '}
                  <span className="font-semibold">{book.borrowedCopies}</span> /{' '}
                  {book.totalCopies}
                </p>
              </div>

              <button
                className="btn btn-outline btn-primary"
                onClick={() => toggleBorrowers(index, book._id)}
              >
                {book.showBorrowers ? 'Hide Borrowers' : 'View Borrowers'}
              </button>
            </div>

            {/* Borrowers List */}
            {book.showBorrowers && (
              <div className="mt-4 p-4 border rounded-lg bg-base-200">
                {(!book.borrowers || book.borrowers.length === 0) && (
                  <p>No one has borrowed this book.</p>
                )}

                {book.borrowers && book.borrowers.length > 0 && (
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Borrowed At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {book.borrowers.map((b, i) => (
                        <tr key={i}>
                          <td>{b.user?.name}</td>
                          <td>{b.user?.email}</td>
                          <td>{new Date(b.borrowedAt).toLocaleDateString()}</td>
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
